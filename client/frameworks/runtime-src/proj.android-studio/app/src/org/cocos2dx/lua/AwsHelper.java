package org.cocos2dx.lua;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.app.Activity;
import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;
import android.view.View;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.cognito.CognitoSyncManager;
import com.amazonaws.mobileconnectors.cognito.Dataset;
import com.amazonaws.mobileconnectors.cognito.DefaultSyncCallback;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.DeleteMessageRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.UserRecoverableAuthException;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.games.Games;
import com.google.android.gms.games.Player;

import org.cocos2dx.lib.Cocos2dxLuaJavaBridge;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AWS 관련 함수 모아두는 곳
 *
 * Created by Administrator on 8/26/2015.
 */
public class AwsHelper {

    private AmazonSQS sqs = null;
    private int messageOrder = 0;
    private CognitoCachingCredentialsProvider credentialsProvider;

    public AWSCredentials getAwsCredentials() {
        return credentialsProvider.getCredentials();
    }

    public int initCognitoCredentials(Context appContext) {
        // Initialize the Amazon Cognito credentials provider
        credentialsProvider = new CognitoCachingCredentialsProvider(
                appContext,
                "us-east-1:da27cca6-6bf6-4938-a40d-da244b5d3232", // Identity Pool ID
                Regions.US_EAST_1 // Region
        );

        return 0;
    }

    public void linkGoogleAccountWithCognito(Activity activity, Context appContext, GoogleApiClient googleApiClient, String accountName) {
        LinkGoogleAccountWithCognitoArgs args = new LinkGoogleAccountWithCognitoArgs();
        args.activity = activity;
        args.appContext = appContext;
        args.googleApiClient = googleApiClient;
        args.accountName = accountName;
        new LinkGoogleAccountWithCognitoTask().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, args, null, null);
    }

    private class LinkGoogleAccountWithCognitoArgs {
        public Activity activity;
        public Context appContext;
        public GoogleApiClient googleApiClient;
        public String accountName;
    }

    private class GetCognitoIdentityIdTaskArgs {
        public AppActivity activity;
    }

    private class LinkGoogleAccountWithCognitoTask extends AsyncTask<LinkGoogleAccountWithCognitoArgs, Void, Void> {

        @Override
        protected Void doInBackground(LinkGoogleAccountWithCognitoArgs... params) {
            Log.d("Sky", "LinkGoogleAccountWithCognitoTask.............");

            String token = "";
            try {
                Log.d("Sky", "Accounts[0].name = " + params[0].accountName);
                String serviceAccountClientId
                        = "audience:server:client_id:309643418125-c94qconl23vpjlbnauso0c9heekbi0cj.apps.googleusercontent.com";
                token = GoogleAuthUtil.getToken(params[0].appContext, params[0].accountName,
                        serviceAccountClientId);

            } catch (IOException e) {
                e.printStackTrace();
            } catch (UserRecoverableAuthException e) {
                params[0].activity.startActivityForResult(e.getIntent(), 2001);
            } catch (GoogleAuthException e) {
                e.printStackTrace();
            }


            Map<String, String> logins = new HashMap<String, String>();
            logins.put("accounts.google.com", token);
            credentialsProvider.setLogins(logins);

            Log.d("Sky", "GoogleAuthUtil.getToken returns " + token);
            String cognitoToken = credentialsProvider.getToken();
            Log.d("Sky", "Cognito Token (After Google Login): " + cognitoToken);
            String identityId = credentialsProvider.getIdentityId();
            Log.d("Sky", "Cognito Identity ID (After Google Login): " + identityId);

            // Cognito Sync 기능 테스트...
            // Initialize the Cognito Sync client
            CognitoSyncManager syncClient = new CognitoSyncManager(
                    params[0].appContext,
                    Regions.US_EAST_1, // Region
                    credentialsProvider);

            Player player = Games.Players.getCurrentPlayer(params[0].googleApiClient);
            String id = player.getPlayerId();
            String name = player.getDisplayName();
            String icon = player.getIconImageUrl();

            // Create a record in a dataset and synchronize with the server
            Dataset dataset = syncClient.openOrCreateDataset("google");
            dataset.put("playerId", id);
            dataset.put("displayName", name);
            dataset.put("iconImageUrl", icon);
            dataset.synchronize(new DefaultSyncCallback() {
                @Override
                public void onSuccess(Dataset dataset, List newRecords) {
                    //Your handler code here
                }
            });

            return null;
        }
    }

    private class ConnectTaskArgs {
        public AWSCredentials awsCredentials;
    }

    private class SendToSqsArgs {
        public String queueUrl;
        public String message;
    }

    private class ReceiveFromSqsArgs {
        public String queueUrl;
        public int waitTimeSeconds;
        public int luaFunc;
        public int finalizeLuaFunc;
    }

    public int getCognitoIdentityId(AppActivity activity) {
        try {
            GetCognitoIdentityIdTaskArgs args = new GetCognitoIdentityIdTaskArgs();
            args.activity = activity;
            new GetCognitoIdentityIdTask().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, args, null, null);
            return 0;
        } catch (Exception e) {
            return -1;
        }
    }

    /** Called when the user touches the button */
    public int connectToSqs(AWSCredentials awsCredentials) {
        try {
            ConnectTaskArgs args = new ConnectTaskArgs();
            args.awsCredentials = awsCredentials;
            new ConnectTask().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, args, null, null);
            return 0;
        } catch (Exception e) {
            return -1;
        }
    }

    public int receiveFromSqs(final String queueUrl, final int waitTimeSeconds, final int luaFunc, final int finalizeLuaFunc) {
        try {
            ReceiveFromSqsArgs args = new ReceiveFromSqsArgs();
            args.queueUrl = queueUrl;
            args.waitTimeSeconds = waitTimeSeconds;
            args.luaFunc = luaFunc;
            args.finalizeLuaFunc = finalizeLuaFunc;
            new ReceiveAndDeleteAllMessagesTask().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, args, null, null);
            return 0;
        } catch (Exception e) {
            return -1;
        }
    }

    public int sendToSqs(final String queueUrl, final String message) {
        try {
            SendToSqsArgs args = new SendToSqsArgs();
            args.queueUrl = queueUrl;
            args.message = message;
            new SendTestMessageTask().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, args, null, null);
            return 0;
        } catch (Exception e) {
            return -1;
        }
    }

    private class GetCognitoIdentityIdTask extends AsyncTask<GetCognitoIdentityIdTaskArgs, Void, Void> {

        @Override
        protected Void doInBackground(GetCognitoIdentityIdTaskArgs... params) {
            Log.d("AWS", "GetCognitoIdentityIdTask.............");
            try
            {
                String identityId = credentialsProvider.getIdentityId();
                Log.d("Sky", "Cognito Identity ID (Before Google Login): " + identityId);

                String deviceId = identityId.replace(':', '-');
                params[0].activity.setDeviceId(deviceId.substring(15));

                Log.d("AWS", "===========================================");
                Log.d("AWS", "GetCognitoIdentityIdTask completed.");
                Log.d("AWS", "===========================================\n");

            }
            catch (Exception e)
            {
                Log.d("AWS", "===========================================");
                Log.d("AWS", "GetCognitoIdentityIdTask ABORTED!!!");
                Log.d("AWS", "===========================================\n");
                e.printStackTrace();
            }
            return null;
        }
    }

    private class ConnectTask extends AsyncTask<ConnectTaskArgs, Void, Void> {

        @Override
        protected Void doInBackground(ConnectTaskArgs... params) {
            Log.d("AWS", "ConnectTask.............");
            try
            {
                sqs = new AmazonSQSClient(params[0].awsCredentials);
                Region usEast1 = Region.getRegion(Regions.US_EAST_1);
                sqs.setRegion(usEast1);

                Log.d("AWS", "===========================================");
                Log.d("AWS", "ConnectTask completed.");
                Log.d("AWS", "===========================================\n");

            }
            catch (Exception e)
            {
                Log.d("AWS", "===========================================");
                Log.d("AWS", "ConnectTask ABORTED!!!");
                Log.d("AWS", "===========================================\n");
                e.printStackTrace();
            }
            return null;
        }
    }

    private class ReceiveAndDeleteAllMessagesTask extends AsyncTask<ReceiveFromSqsArgs, Void, Void> {

        @Override
        protected Void doInBackground(ReceiveFromSqsArgs... params) {
            Log.d("AWS", "ReceiveAndDeleteAllMessagesTask.............");
            try
            {
                try {
                    // Receive messages
                    Log.d("AWS", "Receiving messages from MyQueue.\n");
                    ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(params[0].queueUrl);
                    receiveMessageRequest.setWaitTimeSeconds(params[0].waitTimeSeconds);
                    receiveMessageRequest.setMaxNumberOfMessages(10);
                    List<Message> messages = sqs.receiveMessage(receiveMessageRequest).getMessages();
                    for (Message message : messages) {
                        Log.d("AWS", "  Message");
                        Log.d("AWS", "    MessageId:     " + message.getMessageId());
                        Log.d("AWS", "    ReceiptHandle: " + message.getReceiptHandle());
                        Log.d("AWS", "    MD5OfBody:     " + message.getMD5OfBody());
                        Log.d("AWS", "    Body:          " + message.getBody());
                        for (Map.Entry<String, String> entry : message.getAttributes().entrySet()) {
                            Log.d("AWS", "  Attribute");
                            Log.d("AWS", "    Name:  " + entry.getKey());
                            Log.d("AWS", "    Value: " + entry.getValue());
                        }

                        Cocos2dxLuaJavaBridge.callLuaFunctionWithString(params[0].luaFunc, message.getBody());
                    }
                    //Cocos2dxLuaJavaBridge.releaseLuaFunction(params[0].luaFunc);

                    Log.d("AWS", "---");

                    for (Message message : messages) {
                        Log.d("AWS", "Deleting a message.\n");
                        String messageRecieptHandle = message.getReceiptHandle();
                        sqs.deleteMessage(new DeleteMessageRequest(params[0].queueUrl, messageRecieptHandle));
                    }

                    Log.d("AWS", "===========================================");
                    Log.d("AWS", "ReceiveAndDeleteAllMessagesTask completed.");
                    Log.d("AWS", "===========================================\n");

                    Cocos2dxLuaJavaBridge.callLuaFunctionWithString(params[0].finalizeLuaFunc, "FIN");
                    //Cocos2dxLuaJavaBridge.releaseLuaFunction(params[0].finalizeLuaFunc);

                } catch (AmazonServiceException ase) {
                    Log.d("AWS", "Caught an AmazonServiceException, which means your request made it " +
                            "to Amazon SQS, but was rejected with an error response for some reason.");
                    Log.d("AWS", "Error Message:    " + ase.getMessage());
                    Log.d("AWS", "HTTP Status Code: " + ase.getStatusCode());
                    Log.d("AWS", "AWS Error Code:   " + ase.getErrorCode());
                    Log.d("AWS", "Error Type:       " + ase.getErrorType());
                    Log.d("AWS", "Request ID:       " + ase.getRequestId());
                } catch (AmazonClientException ace) {
                    Log.d("AWS", "Caught an AmazonClientException, which means the client encountered " +
                            "a serious internal problem while trying to communicate with SQS, such as not " +
                            "being able to access the network.");
                    Log.d("AWS", "Error Message: " + ace.getMessage());
                }
            }
            catch (Exception e)
            {
                e.printStackTrace();

                Log.d("AWS", "===========================================");
                Log.d("AWS", "ReceiveAndDeleteAllMessagesTask ABORTED!!!");
                Log.d("AWS", "===========================================\n");
            }
            return null;
        }
    }

    private class SendTestMessageTask extends AsyncTask<SendToSqsArgs, Void, Void> {

        @Override
        protected Void doInBackground(SendToSqsArgs... params) {
            Log.d("AWS", "SendTestMessageTask.............");
            try
            {
                try {
                    // Send a message
                    Log.d("AWS", "Sending a message to MyQueue.\n");
                    sqs.sendMessage(new SendMessageRequest(params[0].queueUrl, params[0].message));

                    messageOrder++;

                    Log.d("AWS", "===========================================");
                    Log.d("AWS", "SendTestMessageTask completed.");
                    Log.d("AWS", "===========================================\n");

                } catch (AmazonServiceException ase) {
                    Log.d("AWS", "Caught an AmazonServiceException, which means your request made it " +
                            "to Amazon SQS, but was rejected with an error response for some reason.");
                    Log.d("AWS", "Error Message:    " + ase.getMessage());
                    Log.d("AWS", "HTTP Status Code: " + ase.getStatusCode());
                    Log.d("AWS", "AWS Error Code:   " + ase.getErrorCode());
                    Log.d("AWS", "Error Type:       " + ase.getErrorType());
                    Log.d("AWS", "Request ID:       " + ase.getRequestId());
                } catch (AmazonClientException ace) {
                    Log.d("AWS", "Caught an AmazonClientException, which means the client encountered " +
                            "a serious internal problem while trying to communicate with SQS, such as not " +
                            "being able to access the network.");
                    Log.d("AWS", "Error Message: " + ace.getMessage());
                }
            }
            catch (Exception e)
            {
                e.printStackTrace();

                Log.d("AWS", "===========================================");
                Log.d("AWS", "SendTestMessageTask ABORTED!!!");
                Log.d("AWS", "===========================================\n");
            }
            return null;
        }


    }
}
