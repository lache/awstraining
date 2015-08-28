
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
            self.user1Name = 'user1'
            self.user2Name = 'user2'
            Android:createBoard(7, 7, self.user1Name, self.user2Name)
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
                self:processDelta(delta)
            end)
        end
    end)

    self:sendEnterRequest()

    --self:drawGrid()
end

function MainScene:processDelta(delta)
    local function mysplit(inputstr, sep)
        if sep == nil then
            sep = "%s"
        end
        local t={}
        local i=1
        for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
            t[i] = str
            i = i + 1
        end
        return t
    end

    local tokens = mysplit(delta, ' ')
    if tokens[1] == 'size' then
    elseif tokens[1] == 'place' then
        -- 로직 코어의 인덱스는 0-based, 여기는 1-based
        if tokens[2] == self.user1Name then
            self:createUser1(tokens[3] + 1, tokens[4] + 1)
        else
            self:createUser2(tokens[3] + 1, tokens[4] + 1)
        end
    elseif tokens[1] == 'turn' then
    elseif tokens[1] == 'move' then
    else
        print('UNKNOWN DELTA COMMAND', tokens[1])
    end
end

function MainScene:createCell(texture1, texture2, texture3, x, y)

    local sx = display.cx - 3 * 80 + (x - 1) * 80
    local sy = display.cy + 3 * 80 - (y - 1) * 80 + 2 * 80

    local textButton = ccui.Button:create()
    textButton:setTouchEnabled(true)
    textButton:setScale9Enabled(false)
    textButton:loadTextures(texture1, texture2, texture3)
    textButton:setContentSize(cc.size(80, 80))
    textButton:setTitleText('')
    textButton:setPosition(sx, sy)
    textButton:addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            printf('Board cell (%d, %d) touched.', x, y)
        end
    end)
    textButton:addTo(self)
end

function MainScene:createUser1(x, y)
    self:createCell('red.png', 'blue.png', 'red.png', x, y)
end

function MainScene:createUser2(x, y)
    self:createCell('blue.png', 'red.png', 'blue.png', x, y)
end

function MainScene:drawGrid()
    for dx = -3, 3 do
        for dy = -3, 3 do
            local x = dx + 4 -- 1, 2, ... 7 (왼쪽에서 오른쪽으로)
            local y = 8 - (dy + 4) -- 1, 2, ... 7 (상단에서 하단으로)
            self:createCell('red.png', 'blue.png', 'red.png', x, y)
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
