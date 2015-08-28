package com.why.ataxx;

import static org.junit.Assert.*;

import org.junit.Test;

public class AtaxxTest {
	
	/**
	 * 델타 로거 기본 기능 테스트 (비기는 시나리오)
	 */
	@Test
	public void testBasicDeltaLogger_Draw() {
		Board board = new Board();
		DeltaLogger dl = new DeltaLogger();
		board.setDeltaLogger(dl);
		board.setSize(4, 1);
		assertEquals("size 4 1", dl.pop().toString());
		
		User user1 = new User("user1");
		User user2 = new User("user2");
		board.place(user1, 1, 0);
		assertEquals("place user1 1 0", dl.pop().toString());
		
		board.place(user2, 2, 0);
		assertEquals("place user2 2 0", dl.pop().toString());
		
		board.nextTurn();
		assertEquals("turn 1", dl.pop().toString());
		
		board.move(user1, 1, 0, 0, 0);
		board.nextTurn();
		
		assertEquals("move user1 1 0 0 0 clone", dl.pop().toString());
		assertEquals("turn 2", dl.pop().toString());
		
		board.move(user2, 2, 0, 3, 0);
		board.nextTurn();
		
		assertEquals("move user2 2 0 3 0 clone", dl.pop().toString());
		assertEquals("draw", dl.pop().toString());
		assertNull(dl.pop());
	}
	
	/**
	 * 델타 로거 기본 기능 테스트 (user1 승리 시나리오)
	 */
	@Test
	public void testBasicDeltaLogger_Winner1() {
		Board board = new Board();
		DeltaLogger dl = new DeltaLogger();
		board.setDeltaLogger(dl);
		board.setSize(4, 1);
		assertEquals("size 4 1", dl.pop().toString());
		
		User user1 = new User("user1");
		User user2 = new User("user2");
		board.place(user1, 0, 0);
		assertEquals("place user1 0 0", dl.pop().toString());
		
		board.place(user2, 3, 0);
		assertEquals("place user2 3 0", dl.pop().toString());
		
		board.nextTurn();
		assertEquals("turn 1", dl.pop().toString());
		
		board.move(user1, 0, 0, 2, 0);
		assertNull(dl.pop());
		
		board.nextTurn();
		assertEquals("move user1 0 0 2 0 move", dl.pop().toString());
		assertEquals("convert user2 user1 3 0", dl.pop().toString());
		assertEquals("winner user1", dl.pop().toString());
		assertNull(dl.pop());
	}
	
	/**
	 * 유저가 한명만 남은 경우 빈 칸이 남아 있더라도 바로 승패처리한다.
	 */
	@Test
	public void testOnlyOneUserAlwaysWins() {
		Board board = new Board();
		board.setSize(4, 1);
		User user1 = new User("user1");
		User user2 = new User("user2");
		board.place(user1, 0, 0);
		board.place(user2, 3, 0);
		board.nextTurn();
		board.move(user1, 0, 0, 2, 0);
		// 한 칸이 비어 있지만 user2가 전멸했으므로 바로 user1 승리로 끝나야 한다.
		assertEquals(Board.NextTurnResult.FINISHED_WINNER, board.nextTurn());
		assertEquals(user1, board.getWinner());
		assertEquals(2, board.getCellCount(user1));
		assertEquals(0, board.getCellCount(user2));
	}
	
	/**
	 * 움직일 수 있는 것이 없는 경우 턴을 넘기는 행위밖에 할 수 없다.
	 */
	@Test
	public void testSkipTurnAtNoMoves() {
		Board board = new Board();
		assertTrue(board.setSize(4, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 1, 0));
		assertTrue(board.place(user2, 2, 0));
		assertEquals(0, board.getTurnCount());
		assertNull(board.getCurrentUser());
		assertEquals(Board.NextTurnResult.OK_SHOULD_SKIP, board.nextTurn());
		assertEquals(1, board.getTurnCount());
		assertEquals(user1, board.getCurrentUser());
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals(2, board.getTurnCount());
		assertEquals(user2, board.getCurrentUser());
	}
	
	/**
	 * 보드가 꽉 찬 상태에서 턴 진행하면 진행되지 않아야 한다. (유저2 승리인 경우)
	 */
	@Test
	public void testNoTurnAtFullyFilledState_Winner2() {
		Board board = new Board();
		assertTrue(board.setSize(3, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 1, 0));
		assertTrue(board.place(user2, 2, 0));
		assertTrue(board.isAllCellsFilled());
		assertEquals(Board.NextTurnResult.FINISHED_WINNER, board.nextTurn());
		assertEquals(user2, board.getWinner());
	}
	
	/**
	 * 보드가 꽉 찬 상태에서 턴 진행하면 진행되지 않아야 한다. (유저1 승리인 경우)
	 */
	@Test
	public void testNoTurnAtFullyFilledState_Winner1() {
		Board board = new Board();
		assertTrue(board.setSize(3, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user1, 1, 0));
		assertTrue(board.place(user2, 2, 0));
		assertTrue(board.isAllCellsFilled());
		assertEquals(Board.NextTurnResult.FINISHED_WINNER, board.nextTurn());
		assertEquals(user1, board.getWinner());
	}
	
	/**
	 * 보드가 꽉 찬 상태에서 턴 진행하면 진행되지 않아야 한다. (무승부의 경우)
	 */
	@Test
	public void testNoTurnAtFullyFilledState_Draw() {
		Board board = new Board();
		assertTrue(board.setSize(2, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 1, 0));
		assertTrue(board.isAllCellsFilled());
		assertEquals(Board.NextTurnResult.FINISHED_DRAW, board.nextTurn());
	}
	
	/**
	 * 1칸 이동 시 자가 복제가 잘 되는지 체크한다.
	 */
	@Test
	public void testFuncMove_SelfDuplication() {
		Board board = new Board();
		assertTrue(board.setSize(4, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 3, 0));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("유저1의 소지 칸 수는 1이다.", 1, board.getCellCount(user1));
		assertEquals("유저2의 소지 칸 수는 1이다.", 1, board.getCellCount(user2));
		assertTrue(board.move(user1, 0, 0, 1, 0));
		assertEquals("유저1의 소지 칸 수는 1이다.", 1, board.getCellCount(user1));
		assertEquals("유저2의 소지 칸 수는 1이다.", 1, board.getCellCount(user2));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("유저1의 소지 칸 수는 2이다.", 2, board.getCellCount(user1));
		assertEquals("유저2의 소지 칸 수는 1이다.", 1, board.getCellCount(user2));
		assertEquals(user1, board.get(0, 0));
		assertEquals(user1, board.get(1, 0));
		assertEquals(null, board.get(2, 0));
		assertEquals(user2, board.get(3, 0));
	}
	
	/**
	 * 아무 행동도 하지 않고 턴을 넘기려고 했을 때 턴이 넘어가지 않아야 한다.
	 */
	@Test
	public void testFuncNextTurnWithoutMove() {
		Board board = new Board();
		assertTrue(board.setSize(4, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 3, 0));
		assertEquals(0, board.getTurnCount());
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals(1, board.getTurnCount());
		assertEquals(Board.NextTurnResult.MOVE_ERROR, board.nextTurn());
		assertEquals(1, board.getTurnCount());
	}
	
	/**
	 * 유저 두 명이서 초기 셋업이 잘 되어 턴이 지나가는지 확인
	 */
	@Test
	public void testFirstNextTurn() {
		Board board = new Board();
		assertTrue(board.setSize(3, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 2, 0));
		assertEquals(0, board.getTurnCount());
		assertNull(board.getCurrentUser());
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals(1, board.getTurnCount());
		assertEquals(user1, board.getCurrentUser());
		assertNull(board.getWinner());
	}
	/**
	 * 크기 지정이 올바른 경우와 올바르지 않은 경우 반환값이 제대로 설정되는지 확인
	 */
	@Test
	public void testFuncSetSize() {
		Board board = new Board();
		assertTrue(board.setSize(4, 1));
		assertTrue(board.setSize(10, 10));
		assertFalse(board.setSize(10, 11));
		assertFalse(board.setSize(1, 1));
		assertFalse(board.setSize(1, 0));
		assertFalse(board.setSize(-2, -1));
		assertFalse(board.setSize(5, -1));
		
		assertTrue(board.setSize(5, 6));
		assertEquals(5, board.getWidth());
		assertEquals(6, board.getHeight());
	}
	
	/**
	 * 초기 소유 상태 설정이 제대로 되는지 확인
	 */
	@Test
	public void testFuncPlace() {
		Board board = new Board();
		assertTrue(board.setSize(4, 1));
		User user = new User();
		assertTrue(board.place(user, 0, 0));
		assertEquals(user, board.get(0, 0));
	}
	
	/**
	 * 승자 체크가 제대로 되는지 확인
	 */
	@Test
	public void testFuncGetWinner() {
		Board board = new Board();
		assertTrue(board.setSize(4, 1));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 3, 0));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertTrue(board.move(user1, 0, 0, 1, 0));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertTrue(board.move(user2, 3, 0, 2, 0));
		assertEquals(Board.NextTurnResult.FINISHED_WINNER, board.nextTurn());
		assertEquals(user2, board.getWinner());
	}
	
	/**
	 * 한 턴에 두 번 움직일 수는 없다.
	 */
	@Test
	public void testConsecutiveMove() {
		Board board = new Board();
		board.setSize(3, 1);
		User user1 = new User();
		User user2 = new User();
		board.place(user1, 0, 0);
		board.place(user2, 2, 0);
		board.nextTurn();
		assertTrue(board.move(user1, 0, 0, 1, 0));
		assertFalse("한 턴에 두 번 움직일 수는 없다.", board.move(user1, 0, 0, 1, 0));
	}
	
	/**
	 * 자기 턴이 아닐 때 액션을 취하려고 하면 실패하는지 확인한다.
	 */
	@Test
	public void testMoveOnWrongTurn() {
		Board board = new Board();
		board.setSize(3, 1);
		User user1 = new User();
		User user2 = new User();
		board.place(user1, 0, 0);
		board.place(user2, 2, 0);
		board.nextTurn();
		assertEquals("user1이 움직일 차례이다.", user1, board.getCurrentUser());
		assertFalse("user2가 움직일 차례가 아니다.", board.move(user2, 2, 0, 1, 0));
	}
	
	/**
	 * 접촉이 일어났을 때 8-neighbor가 모두 잘 변환되는지 확인한다.
	 */
	@Test
	public void test8NeighborConversionMove() {
		Board board = new Board();
		board.setSize(4, 4);
		User user1 = new User();
		User user2 = new User();
		board.place(user1, 0, 0);
		board.place(user2, 1, 1); board.place(user2, 2, 1); board.place(user2, 3, 1);
		board.place(user2, 1, 2); 							board.place(user2, 3, 2);
		board.place(user2, 1, 3); board.place(user2, 2, 3); board.place(user2, 3, 3);
		board.nextTurn();
		board.move(user1, 0, 0, 2, 2);
		board.nextTurn();
		assertEquals(null, board.get(0, 0));
		assertEquals(user1, board.get(1, 1));
		assertEquals(user1, board.get(2, 1));
		assertEquals(user1, board.get(3, 1));
		assertEquals(user1, board.get(1, 2));
		assertEquals(user1, board.get(2, 2));
		assertEquals(user1, board.get(3, 2));
		assertEquals(user1, board.get(1, 3));
		assertEquals(user1, board.get(2, 3));
		assertEquals(user1, board.get(3, 3));
	}
	
	/**
	 * 접촉이 일어났을 때 변환이 잘 되는지 체크한다.
	 */
	public void testConversionMove() {
		Board board = new Board();
		board.setSize(4, 1);
		User user1 = new User();
		User user2 = new User();
		board.place(user1, 0, 0);
		board.place(user2, 2, 0);
		board.place(user2, 3, 0);
		assertEquals(user1, board.get(0, 0));
		assertEquals(null, board.get(1, 0));
		assertEquals(user2, board.get(2, 0));
		assertEquals(user2, board.get(3, 0));
		board.nextTurn();
		board.move(user1, 0, 0, 1, 0);
		board.nextTurn();
		assertEquals(user1, board.get(0, 0));
		assertEquals(user1, board.get(1, 0));
		assertEquals(user1, board.get(2, 0));
		assertEquals(user2, board.get(3, 0));
	}
	
	/**
	 * 2칸 이동 시 자가 복제가 되지 않는지 체크한다.
	 */
	@Test
	public void testLongMove() {
		Board board = new Board();
		board.setSize(5, 1);
		User user1 = new User();
		User user2 = new User();
		board.place(user1, 0, 0);
		board.place(user2, 4, 0);
		board.nextTurn();
		assertEquals("유저1의 소지 칸 수는 1이다.", 1, board.getCellCount(user1));
		assertEquals("유저2의 소지 칸 수는 1이다.", 1, board.getCellCount(user2));
		assertTrue(board.move(user1, 0, 0, 2, 0));
		assertEquals("유저1의 소지 칸 수는 1이다.", 1, board.getCellCount(user1));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("유저1의 소지 칸 수는 1이다.", 1, board.getCellCount(user1));
		assertEquals("유저2의 소지 칸 수는 1이다.", 1, board.getCellCount(user2));
		assertEquals(null, board.get(0, 0));
		assertEquals(null, board.get(1, 0));
		assertEquals(user1, board.get(2, 0));
		assertEquals(null, board.get(3, 0));
		assertEquals(user2, board.get(4, 0));
	}
	
	
	
	/**
	 * 유저가 셀 이동 시 제약 조건을 체크한다.
	 */
	@Test
	public void testMoveLimit() {
		Board board = new Board();
		assertTrue(board.setSize(10, 10));
		User user1 = new User();
		User user2 = new User();
		assertTrue(board.place(user1, 0, 0));
		assertTrue(board.place(user2, 9, 9));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("2칸을 초과해서 이동시킬 수는 없다.", false, board.move(user1, 0, 0, 3, 0));
		assertEquals("2칸을 초과하지 않으면 이동되어야 한다.", true, board.move(user1, 0, 0, 2, 0));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("2칸을 초과하지 않으면 이동되어야 한다.", true, board.move(user2, 9, 9, 7, 7));
		assertEquals(Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("없는 칸에서 이동할 수는 없다.", false, board.move(user1, 5, 5, 5, 6));
		assertEquals("이미 소유된 곳으로 이동할 수는 없다.", false, board.move(user1, 0, 0, 2, 0));
		assertEquals("자기 자리로 이동할 수는 없다.", false, board.move(user1, 0, 0, 0, 0));
		assertEquals("문제 없이 이동되어야 한다.", true, board.move(user1, 2, 0, 0, 0));
	}
	
	/**
	 * 초기 셋업 시 범위를 벗어난 셀에 유저가 점유할 수는 없다.
	 */
	@Test
	public void testOutOfBoundsChecks() {
		Board board = new Board();
		board.setSize(2, 1);
		User user1 = new User();
		assertEquals("보드 바깥에다가 둘 수는 없다.", false, board.place(user1, 3, 4));
	}
	
	/**
	 * 초기 셋업 시 이미 다른 유저가 점유하고 있는 셀을 유저가 점유할 수는 없다.
	 */
	@Test
	public void testAlreadyPlacedCellChecks() {
		Board board = new Board();
		board.setSize(2, 1);
		User user1 = new User();
		User user2 = new User();
		assertEquals(true, board.place(user1, 0, 0));
		assertEquals("유저1이 이미 점유하고 있는 셀을 점유할 수 없다.", false, board.place(user2, 0, 0));
	}
	
	/**
	 * 보드 크기, 유저 조건이 만족되지 않으면 턴이 진행될 수 없다.
	 */
	@Test
	public void testNextTurnChecks() {
		Board board = new Board();
		assertEquals("보드 크기 오류 시 턴이 진행될 수 없다.", Board.NextTurnResult.SIZE_ERROR, board.nextTurn());
		assertEquals("보드 크기는 최소 2칸 이상이어야 한다.", false, board.setSize(1, 1));
		assertEquals("보드 크기가 2칸보다 작을 시 턴이 진행될 수 없다.", Board.NextTurnResult.SIZE_ERROR, board.nextTurn());
		assertEquals("보드 크기는 최소 2칸 이상이어야 한다.", true, board.setSize(2, 1));
		assertEquals("유저가 둘 이상 없으면 턴이 진행될 수 없다.", Board.NextTurnResult.USER_ERROR, board.nextTurn());
		User user1 = new User();
		User user2 = new User();
		assertEquals(true, board.place(user1, 0, 0));
		assertEquals("유저가 둘 이상 없으면 턴이 진행될 수 없다.", Board.NextTurnResult.USER_ERROR, board.nextTurn());
		assertEquals(true, board.place(user2, 1, 0));
		assertEquals("턴이 진행되어야 한다.", Board.NextTurnResult.FINISHED_DRAW, board.nextTurn());
	}
	
	/**
	 * 너비 3 높이 1인 보드에서 (0,0)에 유저1이, (2,0)에 유저2가 소지한 상태에서 시작한다.
	 * 첫째 턴에서 유저1이 (0,0)에서 (1,0)으로 복제시키고 턴을 종료한다.
	 * 3:0 스코어로 유저1이 승리한다.
	 */
	@Test
	public void testBasicPlacements() {
		Board board = new Board();
		assertEquals("보드 생성 직후 턴은 0이어야 한다.", 0, board.getTurnCount());
		assertEquals("보드 생성 크기는 최소 2칸 이상이어야 한다.", true, board.setSize(3, 1));
		assertEquals("보드 너비는 3이어야 한다.", 3, board.getWidth());
		assertEquals("보드 높이는 1이어야 한다.", 1, board.getHeight());
		User user1 = new User();
		assertEquals("유저1이 소지한 칸 수는 0이어야 한다.", 0, board.getCellCount(user1));
		assertEquals("유저1이 (0,0)을 소지하는 것이 성공해야 한다.", true, board.place(user1, 0, 0));
		assertEquals("유저1이 소지한 칸 수는 1이어야 한다.", 1, board.getCellCount(user1));
		assertEquals("(0,0) 위치를 소지한 유저는 유저1이어야 한다.", user1, board.get(0, 0));
		User user2 = new User();
		assertEquals("유저2가 소지한 칸 수는 0이어야 한다.", 0, board.getCellCount(user2));
		assertEquals("유저2가 (2,0)을 소지하는 것이 성공해야 한다.", true, board.place(user2, 2, 0));
		assertEquals("유저2가 소지한 칸 수는 1이어야 한다.", 1, board.getCellCount(user2));
		assertEquals("(2,0) 위치를 소지한 유저는 유저2여야 한다.", user2, board.get(2, 0));
		assertEquals("(1,0) 위치를 소지한 유저는 없어야 한다.", null, board.get(1, 0));
		assertEquals("현재 턴은 0이어야 한다.", 0, board.getTurnCount());
		assertEquals("현재 플레이어는 없어야 한다.", null, board.getCurrentUser());
		assertEquals("초기 설정이 되었으면 턴이 진행되어야 한다.", Board.NextTurnResult.OK, board.nextTurn());
		assertEquals("현재 턴은 1이어야 한다.", 1, board.getTurnCount());
		assertEquals("유저1 차례여야 한다.", user1, board.getCurrentUser());
		assertEquals("유저1이 (0,0)->(1,0)으로 복제될 수 있어야 한다.", true, board.move(user1, 0, 0, 1, 0));
		assertEquals("유저1이 복제 액션을 했더라도 턴 진행 전까지는 복제가 진행되지 않아야 한다.", 1, board.getCellCount(user1));
		assertEquals("턴이 진행되어야 한다.", Board.NextTurnResult.FINISHED_WINNER, board.nextTurn());
		assertEquals("현재 턴은 2이어야 한다.", 2, board.getTurnCount());
		assertEquals("유저2 차례여야 한다.", user2, board.getCurrentUser());
		assertEquals("복제가 되었으므로 유저1이 소지한 칸 수는 3이어야 한다.", 3, board.getCellCount(user1));
		assertEquals("복제를 당했으므로 유저2가 소지한 칸 수는 0이어야 한다.", 0, board.getCellCount(user2));
		assertEquals("승자가 유저1이어야 한다.", user1, board.getWinner());
		assertEquals("게임이 종료됐으므로 턴은 더 진행되지 않아야 한다.", Board.NextTurnResult.ALREADY_FINISHED, board.nextTurn());
		assertEquals("현재 턴은 여전히 2이어야 한다.", 2, board.getTurnCount());
	}
}
