package com.why.ataxx;

public class MoveDelta extends Delta {

	private String name;
	private int moveFromX;
	private int moveFromY;
	private int moveToX;
	private int moveToY;
	private boolean clone;

	public MoveDelta(String name, int moveFromX, int moveFromY, int moveToX, int moveToY) {
		this.name = name;
		this.moveFromX = moveFromX;
		this.moveFromY = moveFromY;
		this.moveToX = moveToX;
		this.moveToY = moveToY;
	}

	public void setClone(boolean b) {
		this.clone = b;
	}
	
	public String toString() {
		return String.format("move %s %d %d %d %d %s",
				name, moveFromX, moveFromY, moveToX, moveToY, clone ? "clone" : "move");
	}

}
