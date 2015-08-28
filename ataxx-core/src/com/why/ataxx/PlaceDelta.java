package com.why.ataxx;

public class PlaceDelta extends Delta {

	private String name;
	private int x;
	private int y;

	public PlaceDelta(String name, int x, int y) {
		this.name = name;
		this.x = x;
		this.y = y;
	}
	
	public String toString() {
		return String.format("place %s %d %d", name, x, y);
	}

}
