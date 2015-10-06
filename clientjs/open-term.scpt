-- Create three Terminal windows.
-- The first Terminal is a tall window.
-- The second Terminal is medium height and is to
-- the tall Terminal's right.
-- The third Terminal is below the medium Terminal
-- and to the right of the tall Terminal.
--
tell application "Terminal"

	-- Running the "clear" command seems to create a
	-- new Terminal window, but I'm sure there is a
	-- better way.
	--
	do script "cd /Users/gb/awstraining/clientjs && ./run_inner.sh && exit"

	-- Set the position/size of the Terminal window
	-- we just created. Top left corner at x=40, y=40
	-- and make its width 500 and height 1200 pixels.
	-- Note that Mac OS menu bar uses about 20 pixels
	-- of the top of the screen.
	-- So, a Y position of 0 to 20 is hidden "under" the menu bar.
	set the bounds of the front window to {0, 0, 639, 1239}

end tell
