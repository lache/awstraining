package org.cocos2dx.lua;

import com.why.ataxx.Board;
import com.why.ataxx.Board.NextTurnResult;
import com.why.ataxx.Delta;
import com.why.ataxx.DeltaLogger;
import com.why.ataxx.User;

import org.cocos2dx.lib.Cocos2dxLuaJavaBridge;

/**
 * Created by Administrator on 8/28/2015.
 */
public class BoardContext {

    private static Board board = null;
    private static DeltaLogger dl = null;
    private static User user1 = null;
    private static User user2 = null;
    private static String user1Name = null;

    public static int createBoard(int width, int height, String name1, String name2) {
        board = new Board();
        dl = new DeltaLogger();
        board.setDeltaLogger(dl);
        board.setSize(width, height);
        user1 = new User(name1);
        user2 = new User(name2);
        board.place(user1, 0, 0);
        board.place(user1, width - 1, height - 1);
        board.place(user2, width - 1, 0);
        board.place(user2, 0, height - 1);
        user1Name = name1;
        return 0;
    }

    public static int nextTurn(int luaFunc) {
        NextTurnResult ntr = board.nextTurn();

        while (true) {
            Delta delta = dl.pop();
            if (delta == null) {
                break;
            }

            Cocos2dxLuaJavaBridge.callLuaFunctionWithString(luaFunc, delta.toString());
        }

        int ret = 0;
        switch (ntr) {
            case OK:
                ret = 0;
                break;
            case FINISHED_WINNER:
                ret = 1;
                break;
            case FINISHED_DRAW:
                ret = 2;
                break;
            case OK_SHOULD_SKIP:
                ret = 3;
                break;
            default:
                ret = 4;
                break;
        }
        return ret;
    }

    public static int move(String name, int x, int y, int x2, int y2) {
        User user = user1Name.compareTo(name) == 0 ? user1 : user2;
        return board.move(user, x, y, x2, y2) ? 0 : 1;
    }
}
