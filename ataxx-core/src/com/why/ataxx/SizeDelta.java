package com.why.ataxx;

public class SizeDelta extends Delta {

	private int width;
	private int height;

	public SizeDelta(int width, int height) {
		this.width = width;
		this.height = height;
	}
	
	public String toString() {
		return String.format("size %d %d", width, height);
	}
}
