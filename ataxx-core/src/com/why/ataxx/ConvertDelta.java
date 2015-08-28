package com.why.ataxx;

public class ConvertDelta extends Delta {

	private String prevName;
	private String name;
	private int x;
	private int y;

	public ConvertDelta(String prevName, String name, int x, int y) {
		this.prevName = prevName;
		this.name = name;
		this.x = x;
		this.y = y;
	}
	
	public String toString() {
		return String.format("convert %s %s %d %d", prevName, name, x, y);
	}

}
