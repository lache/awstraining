package org.cocos2dx.lua;

import android.os.AsyncTask;
import android.util.Log;
import android.view.View;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.DeleteMessageRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageRequest;

import org.cocos2dx.lib.Cocos2dxLuaJavaBridge;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 8/26/2015.
 */
public class AwsHelper {
    private AmazonSQS sqs = null;
    //private String queueUrl = "https://sqs.us-east-1.amazonaws.com/280548294548/testq";
    //private String accessKey = "AKIAINDOUJOVHO5CHIRA";
    //private String secretKey = "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";
    private int messageOrder = 0;

    private class ConnectTaskArgs {
        public String accessKey;
        public String secretKey;
    }

    private class SendToSqsArgs {
        public String queueUrl;
        public String message;
    }

    private class ReceiveFromSqsArgs {
        public String queueUrl;
        public int waitTimeSeconds;
        public int luaFunc;
    }

    /** Called when the user touches the button */
    public int connectToSqs(final String accessKey, final String secretKey) {
        try {
            ConnectTaskArgs args = new ConnectTaskArgs();
            args.accessKey = accessKey;
            args.secretKey = secretKey;
            new ConnectTask().executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, args, null, null);
            return 0;
        } catch (Exception e) {
            return -1;
        }
    }

    public int receiveFromSqs(final String queueUrl, final int waitTimeSeconds, final int luaFunc) {
        try {
            ReceiveFromSqsArgs args = new ReceiveFromSqsArgs();
            args.queueUrl = queueUrl;
            args.waitTimeSeconds = waitTimeSeconds;
            args.luaFunc = luaFunc;
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

    private class ConnectTask extends AsyncTask<ConnectTaskArgs, Void, Void> {

        @Override
        protected Void doInBackground(ConnectTaskArgs... params) {
            Log.d("AWS", "ConnectTask.............");
            try
            {
                AWSCredentials credentials = null;
                try {
                    credentials = new BasicAWSCredentials(params[0].accessKey, params[0].secretKey);

                } catch (Exception e) {
                    throw new AmazonClientException(
                            "Cannot load the credentials from the credential profiles file. " +
                                    "Please make sure that your credentials file is at the correct " +
                                    "location (~/.aws/credentials), and is in valid format.",
                            e);
                }

                sqs = new AmazonSQSClient(credentials);
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
                    Cocos2dxLuaJavaBridge.releaseLuaFunction(params[0].luaFunc);
                    Log.d("AWS", "---");

                    for (Message message : messages) {
                        Log.d("AWS", "Deleting a message.\n");
                        String messageRecieptHandle = message.getReceiptHandle();
                        sqs.deleteMessage(new DeleteMessageRequest(params[0].queueUrl, messageRecieptHandle));
                    }

                    Log.d("AWS", "===========================================");
                    Log.d("AWS", "ReceiveAndDeleteAllMessagesTask completed.");
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
