package com.why.ataxx;

public class TurnDelta extends Delta {

	private int turnCount;

	public TurnDelta(int turnCount) {
		this.turnCount = turnCount;
	}
	
	public String toString() {
		return String.format("turn %d", turnCount);
	}

}
