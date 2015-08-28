package com.why.ataxx;

import java.util.ArrayList;

public class DeltaLogger {
	
	private ArrayList<Delta> deltaList = new ArrayList<Delta>();

	public Delta pop() {
		return deltaList.size() > 0 ? deltaList.remove(0) : null;
	}

	public void enqueue(Delta delta) {
		deltaList.add(delta);
	}
}
