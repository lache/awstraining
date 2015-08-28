package com.why.ataxx;

public class User {

	private String name;
	
	public User() {
	}

	public User(String name) {
		this.name = name;
	}
	
	public String toString() {
		return name != null && name.length() > 0 ? name : super.toString();
	}
}
