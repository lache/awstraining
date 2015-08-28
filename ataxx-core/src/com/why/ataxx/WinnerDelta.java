package com.why.ataxx;

public class WinnerDelta extends Delta {

	private String name;

	public WinnerDelta(String name) {
		this.name = name;
	}
	
	public String toString() {
		return String.format("winner %s", name);
	}

}
