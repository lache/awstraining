local Android = class('Android')

local className = "org/cocos2dx/lua/AppActivity"
local boardClassName = "org/cocos2dx/lua/BoardContext"

function Android:createBoard(width, height, name1, name2)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:createBoard(%d, %d, "%s", "%s") called.',
            width, height, name1, name2)
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { width, height, name1, name2 }
    local sigs = "(IILjava/lang/String;Ljava/lang/String;)I"
    local ok, ret = luaj.callStaticMethod(boardClassName, "createBoard",
        args, sigs)
    if ok then
        print("Android:createBoard The ret is:", ret)
    else
        print("Android:createBoard luaj error:", ret)
    end
    return ret
end

function Android:move(name, x, y, x2, y2)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:move("%s", %d, %d, %d, %d) called.',
            name, x, y, x2, y2)
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { name, x, y, x2, y2 }
    local sigs = "(Ljava/lang/String;IIII)I"
    local ok, ret = luaj.callStaticMethod(boardClassName, "move",
        args, sigs)
    if ok then
        print("Android:move The ret is:", ret)
    else
        print("Android:move luaj error:", ret)
    end
    return ret
end

function Android:nextTurn(callbackLua)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:nextTurn([%s]) called.',
            tostring(callbackLua))
        callbackLua('simulated nextTurn callback called.')
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { callbackLua }
    local sigs = "(I)I"
    local ok, ret = luaj.callStaticMethod(boardClassName, "nextTurn",
        args, sigs)
    if ok then
        print("Android:nextTurn The ret is:", ret)
    else
        print("Android:nextTurn luaj error:", ret)
    end
    return ret
end

function Android:getDeviceId(callbackLua)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:getDeviceId([%s]) called.',
            tostring(callbackLua))
        callbackLua('FAKE-DEVICE-ID')
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { callbackLua }
    local sigs = "(I)I"
    local ok, ret = luaj.callStaticMethod(className, "getDeviceId",
        args, sigs)
    if ok then
        print("Android:getDeviceId The ret is:", ret)
    else
        print("Android:getDeviceId luaj error:", ret)
    end
    return ret
end

function Android:signIn(callbackLua)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:signIn([%s]) called.',
            tostring(callbackLua))
        callbackLua('This is simulated sign in message...')
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { callbackLua }
    local sigs = "(I)I"
    local ok, ret = luaj.callStaticMethod(className, "signIn",
        args, sigs)
    if ok then
        print("Android:signIn The ret is:", ret)
    else
        print("Android:signIn luaj error:", ret)
    end
    return ret
end

function Android:connectToSqs()
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:connectToSqs() called.')
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { }
    local sigs = "()I"
    local ok, ret  = luaj.callStaticMethod(className, "connectToSqs",
        args, sigs)
    if ok then
        print("Android:connectToSqs The ret is:", ret)
    else
        print("Android:connectToSqs luaj error:", ret)
    end
    return ret
end

function Android:sendToSqs(queueUrl, message)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:sendToSqs("%s", "%s") called.',
            queueUrl, message)
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { queueUrl, message }
    local sigs = "(Ljava/lang/String;Ljava/lang/String;)I"
    local ok, ret  = luaj.callStaticMethod(className, "sendToSqs",
        args, sigs)
    if ok then
        print("Android:sendToSqs The ret is:", ret)
    else
        print("Android:sendToSqs luaj error:", ret)
    end
    return ret
end

function Android:receiveFromSqs(queueUrl, waitTimeSeconds,
    callbackLua, finalizeCallbackLua)

    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:receiveFromSqs("%s", %d, [%s], [%s]) called.',
            queueUrl, waitTimeSeconds,
            tostring(callbackLua), tostring(finalizeCallbackLua))
        callbackLua('This is simulated message 1...')
        callbackLua('This is simulated message 2...')
        callbackLua('This is simulated message 3...')
        finalizeCallbackLua('FIN')
        return
    end

    --[[
    local function callbackLua(param)
        if "success" == param then
            print("java call back success")
        end
    end
    ]]
    local luaj = require "cocos.cocos2d.luaj"
    local args = { queueUrl, waitTimeSeconds, callbackLua, finalizeCallbackLua }
    local sigs = "(Ljava/lang/String;III)I"
    local ok, ret = luaj.callStaticMethod(className, "receiveFromSqs",
        args, sigs)
    if ok then
        print("Android:receiveFromSqs The ret is:", ret)
    else
        print("Android:receiveFromSqs luaj error:", ret)
    end
    return ret
end

return Android
