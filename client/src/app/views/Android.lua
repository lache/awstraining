local Android = class('Android')

local className = "org/cocos2dx/lua/AppActivity"

function Android:connectToSqs(accessKey, secretKey)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:connectToSqs("%s", "%s") called.',
            accessKey, secretKey)
        return
    end

    local luaj = require "cocos.cocos2d.luaj"
    local args = { accessKey , secretKey }
    local sigs = "(Ljava/lang/String;Ljava/lang/String;)I"
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

function Android:receiveFromSqs(queueUrl, waitTimeSeconds, callbackLua)
    local targetPlatform = cc.Application:getInstance():getTargetPlatform()
    if cc.PLATFORM_OS_ANDROID ~= targetPlatform then
        printf('[SIMULATED] Android:receiveFromSqs("%s", %d, [%s]) called.',
            queueUrl, waitTimeSeconds, tostring(callbackLua))
        callbackLua('This is simulated message...')
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
    local args = { queueUrl, waitTimeSeconds, callbackLua }
    local sigs = "(Ljava/lang/String;II)I"
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
