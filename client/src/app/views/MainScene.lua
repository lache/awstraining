
local MainScene = class("MainScene", cc.load("mvc").ViewBase)
local Android = import('.Android')

MainScene.RESOURCE_FILENAME = "MainScene.csb"

function MainScene:onCreate()
    printf("resource node = %s", tostring(self:getResourceNode()))

    self.queueUrl = 'https://sqs.us-east-1.amazonaws.com/280548294548/testq'

    self.hud = self:getResourceNode()

    self.hud:getChildByTag(1001):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:signIn()
        end
    end)
    self.hud:getChildByTag(1002):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:connect()
        end
    end)
    self.hud:getChildByTag(1003):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:send()
        end
    end)
    self.hud:getChildByTag(1004):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:receive()
        end
    end)

    self.hud:getChildByTag(2001):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            Android:createBoard(7, 7, 'user1', 'user2')
        end
    end)
    self.hud:getChildByTag(2002):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            Android:move('user1', 0, 0, 1, 0)
        end
    end)
    self.hud:getChildByTag(2003):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            Android:nextTurn(function (delta)
                print('BOARD DELTA:', delta)
            end)
        end
    end)

    self:sendEnterRequest()

    self:drawGrid()
end

function MainScene:drawGrid()
    for dx = -3, 3 do
        for dy = -3, 3 do
            display.newSprite('red.png')
                :move(cc.p(display.cx + dx * 80, display.cy + (dy + 2) * 80))
                :addTo(self)
        end
    end
end

function MainScene:signIn()
    Android:signIn(function (result)
        print('Signin result = ', result)
    end)
end

function MainScene:connect()
    Android:connectToSqs()
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
