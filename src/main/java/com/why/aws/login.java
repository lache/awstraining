package com.why.aws;

import java.io.IOException;
import java.util.Properties;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClient;
import com.amazonaws.services.sqs.model.CreateQueueRequest;
import com.google.gson.Gson;
import com.why.common.EnterRequest;

public class login {
	
    public String myHandler(Object object, Context context) {
    	
        LambdaLogger logger = context.getLogger();
        logger.log("received : " + object.toString());
        
        Gson gson = new Gson();
        EnterRequest enterData = gson.fromJson(object.toString(), EnterRequest.class);
        
        Properties prop = new Properties();
        try {
			prop.load(login.class.getResourceAsStream("AwsCredentials.properties"));
			
	        BasicAWSCredentials cred = new BasicAWSCredentials(
	        		prop.getProperty("accessKey"),
	        		prop.getProperty("secretKey"));
	        
	        AmazonSQS sqs = new AmazonSQSClient(cred);
	        sqs.setEndpoint("https://sqs.us-west-2.amazonaws.com");

	        CreateQueueRequest req = new CreateQueueRequest(enterData.deviceId);
	        String queueUrl = sqs.createQueue(req).getQueueUrl();
	        
	        return queueUrl;
	        
		} catch (IOException e) {
			
			e.printStackTrace();
			return "exception";
			
		} finally {
		}
    }

    public static void main(String[] args) {
    	
    	long startTick = System.currentTimeMillis();
        try {
			
	        BasicAWSCredentials cred = new BasicAWSCredentials(
	        		"AKIAIGG2M6JM6D656QYQ", "BqW30kIJ3x5kpN/WI2xwDxbZ4JvOdq1hzxcwg/BF");
	        
	        AmazonSQS sqs = new AmazonSQSClient(cred);
	        sqs.setEndpoint("https://sqs.us-east-1.amazonaws.com");
//	        sqs.setEndpoint("https://sqs.us-west-2.amazonaws.com");

	        {
		        CreateQueueRequest req = new CreateQueueRequest("test-queue");
		        String queueUrl = sqs.createQueue(req).getQueueUrl();
		        System.out.println(queueUrl);
	        }
	        {
		        CreateQueueRequest req = new CreateQueueRequest("test-queue2");
		        String queueUrl = sqs.createQueue(req).getQueueUrl();
		        System.out.println(queueUrl);
	        }
	        
		} finally {
		}
        
        System.out.println("" + (System.currentTimeMillis() - startTick));
    }
}
