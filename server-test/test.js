var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: "myKeyId", secretAccessKey: "secretKey", region: "us-east-1" });

var dyn = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });


dyn.listTables(function (err, data)
{
   console.log('listTables err - ',err);
   console.log('listTables data - ',data);
   for (var i in data.TableNames) {
       console.log(data.TableNames[i]);
   }
});

var params = {
    TableName: 'AppDevice',
    KeySchema: [
        {
            AttributeName: 'Id',
            KeyType: 'HASH'
        }
    ],
    AttributeDefinitions: [
        {
            AttributeName: 'Id',
            AttributeType: 'S'
        }
    ],
    ProvisionedThroughput:  {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    }
};
console.log("Creating the AppDevice table");
dyn.createTable(params, function(err, data) {
    if (err) console.log(err); // an error occurred
    else console.log(data); // successful response
});

var params2 = {
    TableName: 'AppDevice',
    Item: {
        Id: {S:"ios:com.popsongremix.sky:AAA22956-1DE0-4DE7-A1D7-35ECAA169970"},
        DateAdded: {S:new Date().toISOString()},
    }
};
console.log("Calling PutItem");
console.log(params2);
dyn.putItem(params2, function(err, data) {
    if (err) console.log(err); // an error occurred
    else console.log("PutItem returned successfully");
});



var params3 = {
    TableName: 'AppDevice',
    Key: {
        Id: {S:"ios:com.popsongremix.sky:AAA22956-1DE0-4DE7-A1D7-35ECAA169970"}
    }
};
console.log("Calling GetItem");
dyn.getItem(params3, function(err, data) {
    console.log("Calling GetItem [RESULT]");
    if (err) console.log(err); // an error occurred
    else console.log(data); // successful response
});











// This example repeatedly scans a number of items at a time, following the pagination token until
// the scan reaches the end of the table.
var params3 = {
    TableName: 'AppDevice',
    Limit: 15  // Limits the number of results per page
};

// Kick off the scan
console.log("Starting a Scan of the AppDevice table");
dyn.scan(params3).eachPage(function(err, data) {
    if (err) {
        console.log(err); // an error occurred
    } else if (data) {
        console.log("Last scan processed " + data.ScannedCount + " items: ");
        var images = [];
        for (var i = 0; i < data.Items.length; i++ ) {
            images.push(data.Items[i].Id.S);
        }
        console.log(" "  + images.join(", "));
    } else {
        console.log("*** Finished scan ***");
    }
});




var params4 = {
    TableName: 'AppDevice',
    Key: {
        Id: {S:"ios:com.popsongremix.sky:AAA22956-1DE0-4DE7-A1D7-35ECAA169970"}
    }
};
console.log("*************** Calling GetItem");
dyn.getItem(params4, function(err, data) {
    if (err) console.log(err); // an error occurred
    else {
        //console.log(data); // successful response

        console.log('ID: ' + data.Item.Id.S);
        console.log('NN: ' + (data.Item.Nickname !== undefined ? data.Item.Nickname.S : '<Not available>'));
    }
});


var params5 = {
    TableName: 'AppDevice',
    Key: {
        Id: {S:"xxx"}
    }
};
console.log("*************** Calling GetItem");
dyn.getItem(params5, function(err, data) {
    if (err) console.log(err); // an error occurred
    else {
        //console.log(data); // successful response
        if (data.Item) {
            console.log('ID: ' + data.Item.Id.S);
            console.log('NN: ' + (data.Item.Nickname ? data.Item.Nickname.S : '<Not available>'));
        } else {
            console.log('NOT FOUND');
        }
    }
});
