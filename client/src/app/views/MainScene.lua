
local MainScene = class("MainScene", cc.load("mvc").ViewBase)
local Android = import('.Android')

MainScene.RESOURCE_FILENAME = "MainScene.csb"

function MainScene:onCreate()
    printf("resource node = %s", tostring(self:getResourceNode()))

    self.queueUrl = 'https://sqs.us-east-1.amazonaws.com/280548294548/testq'
    self.cells = {}
    self.logLineList = {}
    self.selects = {}
    self.width = 4
    self.height = 4
    self.user1Name = 'user1'
    self.user2Name = 'user2'
    self.currentUserName = nil

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
            self:clearSelected()
            self:clearNeighborCells()
            self:clearAllCells()
            self:clearLog()
            self.winnerName = nil
            self.currentUserName = nil

            Android:createBoard(self.width, self.height,
                self.user1Name, self.user2Name)
            self:nextTurn()
        end
    end)
    self.hud:getChildByTag(2002):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            Android:move(self.currentUserName, 0, 0, 1, 0)
            --self:log('Test move...')
        end
    end)
    self.hud:getChildByTag(2003):addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:nextTurn()
            --self:log('Test nextTurn...')
        end
    end)

    self.logText = self.hud:getChildByTag(4)
    assert(self.logText)

    self:sendEnterRequest()

    --self:drawGrid()

    --self:createUser1(4, 4)
    --self:createUser2(5, 4)
    --self:createUser1(6, 4)
    --self:createNearSelect(4, 3)
    --self:createFarSelect(4, 2)

    self.turnEffect = cc.CSLoader:createNode('Turn.csb')
        :move(cc.p(display.cx, display.cy))
        :addTo(self, 100)
    self.turnText = self.turnEffect:getChildByTag(1):getChildByTag(10)
    assert(self.turnText)

    self:createKeyboardHandler()

    self:log('Ataxx 준비 완료')

end

function MainScene:clearAllCells()
    for k, v in ipairs(self.cells) do
        v:removeSelf()
        --print('Cell removed.')
    end
    self.cells = {}
end

function MainScene:nextTurn()
    Android:nextTurn(function (delta)
        self:processDelta(delta)
    end)
end

function MainScene:createKeyboardHandler()
    local function onKeyReleased(keyCode, event)
        if keyCode == cc.KeyCode.KEY_BACK then
            os.exit()
        elseif keyCode == cc.KeyCode.KEY_MENU  then
        elseif keyCode == cc.KeyCode.KEY_1  then
        elseif keyCode == cc.KeyCode.KEY_2  then
        elseif keyCode == cc.KeyCode.KEY_3  then
        elseif keyCode == cc.KeyCode.KEY_4  then
        elseif keyCode == cc.KeyCode.KEY_5  then
        elseif keyCode == cc.KeyCode.KEY_6  then
        elseif keyCode == cc.KeyCode.KEY_F1 then
        elseif keyCode == cc.KeyCode.KEY_C then
            self:processDelta('convert user2 user1 4 3')
        elseif keyCode == cc.KeyCode.KEY_R then
        elseif keyCode == cc.KeyCode.KEY_T then
            self:processDelta('turn 1')
        elseif keyCode == cc.KeyCode.KEY_J then
            self:processMove(self.currentUserName, 4, 4, 3, 4, 'clone')
        end
    end

    local listener = cc.EventListenerKeyboard:create()
    listener:registerScriptHandler(onKeyReleased, cc.Handler.EVENT_KEYBOARD_RELEASED )

    local eventDispatcher = self:getEventDispatcher()
    eventDispatcher:addEventListenerWithSceneGraphPriority(listener, self)
end

function MainScene:showEffectText(text)
    self.turnEffect:stopAllActions()
    self.turnText:setString(text)
    local timeline = cc.CSLoader:createTimeline('Turn.csb')
    self.turnEffect:runAction(timeline)
    timeline:play('pop', false)
end

function MainScene:showTurnEffect(turn)
    self:showEffectText('제' .. turn .. '턴')
end

function MainScene:showWinnerEffect(winnerName)
    self:showEffectText(winnerName .. '님 승리!')
end

function MainScene:showDrawEffect()
    self:showEffectText('무승부')
end

function MainScene:clearLog()
    self.logText:setString('')
    self.logLineList = {}
end

function MainScene:log(s)
    while #self.logLineList >= 20 do
        table.remove(self.logLineList, 1)
    end
    table.insert(self.logLineList, s)
    local t = ''
    for k, v in ipairs(self.logLineList) do
        t = t .. '\n' .. v
    end
    self.logText:setString(t)
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

    self:log('DELTA RECV:' .. delta)

    local tokens = mysplit(delta, ' ')
    if tokens[1] == 'size' then
        self:log('델타: size')
    elseif tokens[1] == 'place' then
        self:log('델타: place')
        -- 로직 코어의 인덱스는 0-based, 여기는 1-based
        if tokens[2] == self.user1Name then
            self:createUser1(tokens[3] + 1, tokens[4] + 1)
        else
            self:createUser2(tokens[3] + 1, tokens[4] + 1)
        end
    elseif tokens[1] == 'turn' then
        self:processTurn(tokens[2])
    elseif tokens[1] == 'move' then
        self:processMove(tokens[2],
            tokens[3] + 1, tokens[4] + 1,
            tokens[5] + 1, tokens[6] + 1,
            tokens[7])
    elseif tokens[1] == 'convert' then
        self:processConvert(tokens[2], tokens[3],
        tokens[4] + 1, tokens[5] + 1)
    elseif tokens[1] == 'winner' then
        self:processWinner(tokens[2])
    elseif tokens[1] == 'draw' then
        self:processDraw()
    else
        self:log('델타: 알 수 없는 이벤트 - ' .. tokens[1])
    end
end

function MainScene:processDraw()
    self:showDrawEffect()
end

function MainScene:processWinner(winnerName)
    self.winnerName = winnerName
    self:showWinnerEffect(winnerName)
end

function MainScene:processConvert(userFrom, userTo, x, y)
    self:removeUserCell(x, y)
    if userTo == self.user1Name then
        self:createUser1(x, y)
    else
        self:createUser2(x, y)
    end
end

function MainScene:processTurn(turn)
    if self.currentUserName == nil then
        self.currentUserName = self.user1Name
    elseif self.currentUserName == self.user1Name then
        self.currentUserName = self.user2Name
    else
        self.currentUserName = self.user1Name
    end
    self:log('[안내] ' .. self.currentUserName .. '님 차례입니다.')
    self:showTurnEffect(turn)
end

function MainScene:removeUserCell(x, y)
    for k, v in ipairs(self.cells) do
        if v.userProp.x == x and v.userProp.y == y then
            table.remove(self.cells, k)
            v:removeSelf()
            break
        end
    end
end

function MainScene:processMove(name, x, y, x2, y2, type)
    -- clone이 아니라면 x, y위치에 있는 셀을 삭제해야 함
    if type ~= 'clone' then
        self:removeUserCell(x, y)
    end

    -- x2, y2위치에 name의 셀을 하나 생성
    if name == self.user1Name then
        self:createUser1(x2, y2)
    else
        self:createUser2(x2, y2)
    end
end

function MainScene:createNearSelect(x, y)
    self:createSelect('nearselect.png', 'nearselect.png', 'nearselect.png', x, y)
end

function MainScene:createFarSelect(x, y)
    self:createSelect('farselect.png', 'farselect.png', 'farselect.png', x, y)
end

function MainScene:createSelect(texture1, texture2, texture3, x, y)

    local sx = display.cx - 3 * 80 + (x - 1) * 80
    local sy = display.cy + 3 * 80 - (y - 1) * 80 + 2 * 80

    local cell = ccui.Button:create()
    cell:setTouchEnabled(true)
    cell:setScale9Enabled(false)
    cell:loadTextures(texture1, texture2, texture3)
    cell:setContentSize(cc.size(80, 80))
    cell:setTitleText('')
    cell:setPosition(sx, sy)
    cell:addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            self:log('선택 셀 (' .. x .. ',' .. y .. ') 터치!')
            self:clearSelected()
            self:clearNeighborCells()
            Android:move(self.currentUserName, self.selectedX - 1, self.selectedY - 1, x - 1, y - 1)
            self:nextTurn()
        end
    end)
    cell:addTo(self)
    cell.userProp = {}
    cell.userProp.x = x
    cell.userProp.y = y

    table.insert(self.selects, cell)
end

function MainScene:createCell(texture1, texture2, texture3, x, y)

    local sx = display.cx - 3 * 80 + (x - 1) * 80
    local sy = display.cy + 3 * 80 - (y - 1) * 80 + 2 * 80

    local cell = ccui.Button:create()
    cell:setTouchEnabled(true)
    cell:setScale9Enabled(false)
    cell:loadTextures(texture1, texture2, texture3)
    cell:setContentSize(cc.size(80, 80))
    cell:setTitleText('')
    cell:setPosition(sx, sy)
    cell:addTouchEventListener(function(sender, eventType)
        if eventType == ccui.TouchEventType.ended then
            printf('Board cell (%d, %d) touched.', x, y)
            if texture1 == 'red.png' then
                self:log('유저1 셀 (' .. x .. ',' .. y .. ') 터치!')
            else
                self:log('유저2 셀 (' .. x .. ',' .. y .. ') 터치!')
            end

            if (texture1 == 'red.png' and self.currentUserName == self.user1Name)
                or (texture1 == 'blue.png' and self.currentUserName == self.user2Name) then
                self:clearSelected()
                cell:setColor(cc.c3b(100,255,255))
                self.selectedX = x
                self.selectedY = y
                self.selected = cell
                self:createNeighborCells(x, y)
            end
        end
    end)
    cell:addTo(self)
    cell.userProp = {}
    cell.userProp.x = x
    cell.userProp.y = y

    table.insert(self.cells, cell)
end

function MainScene:clearSelected()
    if self.selected then
        self.selected:setColor(cc.c3b(255,255,255))
    end
    self.selected = nil
end

function MainScene:clearNeighborCells()
    for k, v in ipairs(self.selects) do
        v:removeSelf()
    end
    self.selects = {}
end

function MainScene:createNeighborCells(x, y)
    self:clearNeighborCells()

    for dx = -2, 2 do
        for dy = -2, 2 do
            local far = math.abs(dx) > 1 or math.abs(dy) > 1
            local xx = x + dx
            local yy = y + dy
            if xx < 1 or xx > self.width or yy < 1 or yy > self.height then
                -- 범위 벗어남
            else
                local existing = false
                for k, v in ipairs(self.cells) do
                    if v.userProp.x == xx and v.userProp.y == yy then
                        existing = true
                        break
                    end
                end

                if existing == false then
                    if far then
                        self:createFarSelect(xx, yy)
                    else
                        self:createNearSelect(xx, yy)
                    end
                end
            end
        end
    end
end

function MainScene:createUser1(x, y)
    self:createCell('red.png', 'red.png', 'red.png', x, y)
end

function MainScene:createUser2(x, y)
    self:createCell('blue.png', 'blue.png', 'blue.png', x, y)
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
