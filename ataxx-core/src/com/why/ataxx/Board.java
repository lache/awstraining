package com.why.ataxx;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Board {
	
	enum NextTurnResult {
		OK,					// 턴이 정상적으로 넘어갔다. 다음 액션을 하면 된다.
		OK_SHOULD_SKIP,		// 턴이 정상적으로 넘어갔다. 그렇지만 이번엔 아무 액션도 하지 못하고 바로 턴만 넘겨야 할 것이다.
		FINISHED_WINNER,	// 턴이 정상적으로 넘어갔다. 승자가 나왔다. 더이상 턴을 진행시킬 수 없다.
		FINISHED_DRAW,		// 턴이 정상적으로 넘어갔다. 무승부로 끝났다. 더이상 턴을 진행시킬 수 없다.
		USER_ERROR,			// 유저 정보에 오류가 있다.
		SIZE_ERROR,			// 보드 크기에 오류가 있다.
		MOVE_ERROR,			// 움직임이 없거나 오류가 있다.
		ALREADY_FINISHED	// 끝난 판이므로 더이상 턴을 진행시킬 수 없다.
	}

	private int width;
	private int height;
	private User[][] cells;
	private int turnCount;
	private ArrayList<User> userList = new ArrayList<User>();
	private int moveFromX;
	private int moveFromY;
	private int moveToX;
	private int moveToY;
	private boolean moveSet;
	private boolean finished;
	private DeltaLogger dl;
	
	public boolean isValidSize() {
		return (width < 0 || height < 0 || width * height < 2 || width * height > 100) == false;
	}
	
	public boolean setSize(int width, int height) {
		if (width < 0 || height < 0 || width * height < 2 || width * height > 100) {
			return false;
		}
		this.width = width;
		this.height = height;
		this.cells = new User[width][height];
		
		enqueueDelta(new SizeDelta(width, height));
		return true;
	}

	public boolean place(User user, int x, int y) {
		if (x < 0 || x >= width || y < 0 || y >= height || cells[x][y] != null) {
			return false;
		}
		
		cells[x][y] = user;
		
		if (userList.contains(user) == false) {
			userList.add(user);
		}
		
		enqueueDelta(new PlaceDelta(user.toString(), x, y));
		return true;
	}

	private void enqueueDelta(Delta delta) {
		if (dl != null) {
			dl.enqueue(delta);
		}
	}

	public int getTurnCount() {
		return turnCount;
	}

	public int getWidth() {
		return width;
	}

	public int getHeight() {
		return height;
	}

	public int getCellCount(User user) {
		int count = 0;
		for (User[] row : cells) {
			for (User u : row) {
				if (u == user) {
					count++;
				}
			}
		}
		return count;
	}

	public User get(int x, int y) {
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return null;
		}
		
		return cells[x][y];
	}

	public NextTurnResult nextTurn() {
		if (isValidSize() == false) {
			return NextTurnResult.SIZE_ERROR;
		}
		if (isValidUser() == false) {
			return NextTurnResult.USER_ERROR;
		}
		if (finished == true) {
			return NextTurnResult.ALREADY_FINISHED;
		}
		
		if (turnCount != 0) {

			if (isCurrentUserCanMove()) {
				if (processMove() == false) {
					return NextTurnResult.MOVE_ERROR;
				}
			}
			
			// 아래 줄 실행 이후에는 다음 턴 유저가 current user가 된다.
			userList.add(userList.remove(0));
		}
		
		turnCount++;
		
		Map<User, Integer> userCount = new HashMap<User, Integer>();
		calculateUserCount(userCount);
		
		if (userCount.entrySet().size() == 1 || isAllCellsFilled()) {
			
			finished = true;
			
			NextTurnResult ntr = NextTurnResult.FINISHED_WINNER;
			
			if (userCount.entrySet().size() == 1) {
				ntr = NextTurnResult.FINISHED_WINNER;
			} else {
				Map.Entry<User, Integer> maxEntry = null;
				maxEntry = getCellCountMaxUser(userCount, maxEntry);
				
				Map.Entry<User, Integer> minEntry = null;
				minEntry = getCellCountMinUser(userCount, minEntry);
				
				ntr = maxEntry.getValue() != minEntry.getValue() ? NextTurnResult.FINISHED_WINNER : NextTurnResult.FINISHED_DRAW;	
			}
			
			if (ntr == NextTurnResult.FINISHED_WINNER) {
				enqueueDelta(new WinnerDelta(getWinner().toString()));
			} else {
				enqueueDelta(new DrawDelta());
			}
			
			return ntr;
		}
		
		enqueueDelta(new TurnDelta(turnCount));
		
		boolean canMove = isCurrentUserCanMove();
		
		return canMove ? NextTurnResult.OK : NextTurnResult.OK_SHOULD_SKIP;
	}

	private Map.Entry<User, Integer> getCellCountMinUser(Map<User, Integer> userCount,
			Map.Entry<User, Integer> minEntry) {
		for (Map.Entry<User, Integer> entry : userCount.entrySet())
		{   
		    if (minEntry == null || entry.getValue().compareTo(minEntry.getValue()) < 0)
		    {
		        minEntry = entry;
		    }
		}
		return minEntry;
	}

	private Map.Entry<User, Integer> getCellCountMaxUser(Map<User, Integer> userCount,
			Map.Entry<User, Integer> maxEntry) {
		for (Map.Entry<User, Integer> entry : userCount.entrySet())
		{
		    if (maxEntry == null || entry.getValue().compareTo(maxEntry.getValue()) > 0)
		    {
		        maxEntry = entry;
		    }
		}
		return maxEntry;
	}

	private void calculateUserCount(Map<User, Integer> userCount) {
		for (User[] row : cells) {
			for (User u : row) {
				if (u != null) {
					userCount.put(u, (userCount.containsKey(u) ? userCount.get(u) : 0) + 1);
				}
			}
		}
	}

	private boolean processMove() {
		// 자기 자신의 위치로는 움직일 수 없다.
		if (moveFromX == moveToX && moveFromY == moveToY) {
			return false;
		}
		
		// 움직이려는 유저 가져온다.
		User user = cells[moveFromX][moveFromY];
		if (user == null) {
			return false;
		}
		
		// 타겟 위치를 user로 설정한다.
		cells[moveToX][moveToY] = user;
		
		MoveDelta moveDelta = new MoveDelta(user.toString(), moveFromX, moveFromY, moveToX, moveToY);
		
		// 점프 이동이라면 원래 위치에서 유저를 삭제한다.
		if (Math.abs(moveFromX - moveToX) > 1 || Math.abs(moveFromY - moveToY) > 1) {
			cells[moveFromX][moveFromY] = null;
			moveDelta.setClone(false);
		} else {
			moveDelta.setClone(true);
		}
		
		enqueueDelta(moveDelta);
		
		// 주변 8-neighbor의 기존 유저를 모두 user로 전환한다.
		for (int dx = -1; dx <= 1; ++dx) {
			for (int dy = -1; dy <= 1; ++dy) {
				convertCellSafe(user, moveToX + dx, moveToY + dy);
			}
		}
		
		// 이동 정보를 리셋한다.
		moveFromX = 0;
		moveFromY = 0;
		moveToX = 0;
		moveToY = 0;
		moveSet = false;
		return true;
	}

	private void convertCellSafe(User user, int x, int y) {
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return;
		}
		
		if (cells[x][y] != null && cells[x][y] != user) {
			User prevUser = cells[x][y];
			cells[x][y] = user;
			
			enqueueDelta(new ConvertDelta(prevUser.toString(), user.toString(), x, y));
		}
	}

	private boolean isValidUser() {
		return userList.size() > 1;
	}

	public User getCurrentUser() {
		return turnCount == 0 ? null : userList.get(0);
	}

	public boolean move(User user, int x, int y, int x2, int y2) {
		if (isValidSize() == false) {
			return false;
		}
		
		if (moveSet == true) {
			return false;
		}
		
		if (user == null) {
			return false;
		}
		
		// 시작위치, 끝위치가 보드 경계 바깥인지 확인
		if (x < 0 || x >= width || y < 0 || y >= height
				|| x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
			return false;
		}
		
		// 시작위치, 끝위치가 완전 동일한지 확인
		if (x == x2 && y == y2) {
			return false;
		}
		
		// 시작위치, 끝위치 거리 차가 2 초과인지 확인
		if (Math.abs(x - x2) > 2 || Math.abs(y - y2) > 2) {
			return false;
		}
		
		// 현재 차례가 아닌데 움직이려고 했는지 확인
		if (getCurrentUser() != user) {
			return false;
		}
		
		// 시작 위치가 user 소유인지 확인
		if (cells[x][y] != user) {
			return false;
		}
		
		// 끝위치가 비어있는지 확인
		if (cells[x2][y2] != null) {
			return false;
		}
		
		moveFromX = x;
		moveFromY = y;
		moveToX = x2;
		moveToY = y2;
		moveSet = true;
		return true;
	}

	public User getWinner() {
		Map<User, Integer> userCount = new HashMap<User, Integer>();
		calculateUserCount(userCount);
		
		if (userCount.size() == 1) {
			
			return userCount.keySet().iterator().next();
			
		} else if (isAllCellsFilled()) {
			
			Map.Entry<User, Integer> maxEntry = null;
			maxEntry = getCellCountMaxUser(userCount, maxEntry);
			
			Map.Entry<User, Integer> minEntry = null;
			minEntry = getCellCountMinUser(userCount, minEntry);
			
			return (userCount.entrySet().size() == 1 || maxEntry.getValue() != minEntry.getValue())
					? maxEntry.getKey() : null;
		}
		
		return null;
	}

	public boolean isAllCellsFilled() {
		for (User[] row : cells) {
			for (User u : row) {
				if (u == null) {
					return false;
				}
			}
		}
		
		return true;
	}

	public boolean isCurrentUserCanMove() {
		User user = getCurrentUser();
		if (user == null) {
			return false;
		}
		
		for (int x = 0; x < width; ++x) {
			for (int y = 0; y < height; ++y) {
				
				if (cells[x][y] == user) {
					
					for (int dx = -2; dx <= 2; ++dx) {
						for (int dy = -2; dy <= 2; ++dy) {
							// 보드 범위 내의 셀이면서 비어있는 것이 있다면
							// 무엇인가는 움직일 수 있다는 뜻이다.
							if (x + dx >= 0 && x + dx < width
									&& y + dy >= 0 && y + dy < height
									&& get(x + dx, y + dy) == null) {
								return true;
							}
						}
					}
				}
			}
		}
		
		return false;
	}

	public void setDeltaLogger(DeltaLogger dl) {
		this.dl = dl;
	}
}
