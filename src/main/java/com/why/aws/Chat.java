package com.why.aws;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.google.gson.Gson;
import com.why.common.ChatData;
import com.why.common.ChatRequest;
import com.why.common.ChatResponse;

public class Chat {

    public String handler(Object object, Context context) {
    	
        try {
            LambdaLogger logger = context.getLogger();
            logger.log("received : " + object.toString());
            
            Gson gson = new Gson();
            ChatRequest chatReq = gson.fromJson(object.toString(), ChatRequest.class);
            
			BasicAWSCredentials cred = new BasicAWSCredentials(
	        		"AKIAIGG2M6JM6D656QYQ", "BqW30kIJ3x5kpN/WI2xwDxbZ4JvOdq1hzxcwg/BF");
	        
	        ChatData chatData = new ChatData();
	        chatData.fromDeviceId = chatReq.fromDeviceId;
	        chatData.toDeviceId = chatReq.toDeviceId;
	        chatData.message = chatReq.message;
	        
	        String fromQueueUrl = "https://sqs.us-east-1.amazonaws.com/292308444981/" + chatData.fromDeviceId;
	        AmazonSQS sqs = new AmazonSQSClient(cred);
	        sqs.sendMessage(fromQueueUrl, (new Gson()).toJson(chatData));
//	        String toQueueUrl = "https://sqs.us-east-1.amazonaws.com/292308444981/" + chatData.toDeviceId;

	        ChatResponse res = new ChatResponse();
	        res.result = "true";
	        res.toDeviceId = chatReq.toDeviceId;
	        res.message = chatReq.message;
	        
	        return gson.toJson(res);
	        
		} catch (Exception e) {
			
			ChatResponse res = new ChatResponse();
			res.result = "false";
			res.error = e.getMessage();
			
			return (new Gson()).toJson(res);
			
		}
    }
}
