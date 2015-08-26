
local MainScene = class("MainScene", cc.load("mvc").ViewBase)
local Android = import('.Android')

MainScene.RESOURCE_FILENAME = "MainScene.csb"

function MainScene:onCreate()
    printf("resource node = %s", tostring(self:getResourceNode()))

    self.queueUrl = 'https://sqs.us-east-1.amazonaws.com/280548294548/testq'
    self.accessKey = 'AKIAINDOUJOVHO5CHIRA'
    self.secretKey = '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'

    self.hud = self:getResourceNode()
    self.hud:getChildByTag(5):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:connect()
        end
    end)
    self.hud:getChildByTag(6):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:send()
        end
    end)
    self.hud:getChildByTag(7):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:receive()
        end
    end)

    self:sendEnterRequest()
end

function MainScene:connect()
    Android:connectToSqs(self.accessKey, self.secretKey)
end

function MainScene:send()
    local c = os.time()
    local ts = os.date("%m/%d %I:%M:%S %p", c)
    Android:sendToSqs(self.queueUrl, 'This message is created at ' .. ts)
end

function MainScene:receive()
    Android:receiveFromSqs(self.queueUrl, 10, function (message)
        print('Message from SQS received: ' .. message)
    end)

end

function MainScene:sendEnterRequest()
    local xhr = cc.XMLHttpRequest:new()
    local apiKey = 'S4SPXHtfsb59WZ6TFtxa68QkbS249bCeayJM7VXR'
    local apiUrl = 'https://3vz2l8ty5i.execute-api.us-east-1.amazonaws.com/prod/chat_enter'
    xhr:setRequestHeader('x-api-key', apiKey)
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    xhr:open("POST", apiUrl)
    local function onReadyStateChange()
      if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
          print('RESPONSE:' .. xhr.response)
          local contents = string.sub(xhr.response, 2, string.len(xhr.response) - 1)
          contents = string.gsub(contents, '\\"', '"')
          print('contents:', contents)
          local m = json.decode(contents)
          print('result:', m.result)
          print('sqsUrl:', m.sqsUrl)
          print('nickname:', m.nickname)


      else
          print("[ERROR] xhr.readyState is:", xhr.readyState,
              "xhr.status is: ",xhr.status,
              "reponse: ", xhr.response)
      end
    end
    xhr:registerScriptHandler(onReadyStateChange)
    xhr:send('{"deviceId":"alien"}')
end

return MainScene
