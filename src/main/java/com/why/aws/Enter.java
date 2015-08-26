package com.why.aws;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.CreateQueueRequest;
import com.google.gson.Gson;
import com.why.common.ChatData;
import com.why.common.EnterRequest;
import com.why.common.EnterResponse;

public class Enter {

    public String handler(Object object, Context context) {
    	
        try {
            LambdaLogger logger = context.getLogger();
            logger.log("received : " + object.toString());
            
            Gson gson = new Gson();
            EnterRequest enterData = gson.fromJson(object.toString(), EnterRequest.class);
            
			BasicAWSCredentials cred = new BasicAWSCredentials(
	        		"AKIAIGG2M6JM6D656QYQ", "BqW30kIJ3x5kpN/WI2xwDxbZ4JvOdq1hzxcwg/BF");
	        
	        AmazonSQS sqs = new AmazonSQSClient(cred);
	        sqs.setEndpoint("https://sqs.us-east-1.amazonaws.com");

	        CreateQueueRequest req = new CreateQueueRequest(enterData.deviceId);
	        String queueUrl = sqs.createQueue(req).getQueueUrl();
	        
	        EnterResponse res = new EnterResponse();
	        res.result = "true";
	        res.sqsUrl = queueUrl;
	        res.nickname = enterData.deviceId;
	        
	        return gson.toJson(res);
	        
		} catch (Exception e) {
			
			EnterResponse res = new EnterResponse();
			res.result = "false";
			res.error = e.getMessage();
			
			return (new Gson()).toJson(res);
			
		}
    }
    
	public static void main(String[] args) {
		
		
    	long startTick = System.currentTimeMillis();
        try {
			
	        BasicAWSCredentials cred = new BasicAWSCredentials(
	        		"AKIAIGG2M6JM6D656QYQ", "BqW30kIJ3x5kpN/WI2xwDxbZ4JvOdq1hzxcwg/BF");
	        
	        AmazonSQS sqs = new AmazonSQSClient(cred);
	        sqs.setEndpoint("https://sqs.us-west-2.amazonaws.com");

	        CreateQueueRequest req = new CreateQueueRequest("test-queue");
	        String queueUrl = sqs.createQueue(req).getQueueUrl();
	        
	        ChatData chatData = new ChatData();
	        chatData.fromDeviceId = "test-queue";
	        chatData.toDeviceId = "test-queue2";
	        chatData.message = "this is a test message";
	        sqs.sendMessage("https://sqs.us-east-1.amazonaws.com/292308444981/test-queue", (new Gson()).toJson(chatData));
	        sqs.sendMessage("https://sqs.us-east-1.amazonaws.com/292308444981/test-queue2", (new Gson()).toJson(chatData));
	        
	        System.out.println(queueUrl);
	        
		} finally {
		}
        
        System.out.println("" + (System.currentTimeMillis() - startTick));
	}

}
