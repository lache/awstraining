package org.cocos2dx.lua;

import android.app.Application;

import com.popsongremix.awstraining.R;

import org.acra.ACRA;
import org.acra.ReportingInteractionMode;
import org.acra.annotation.ReportsCrashes;

/**
 * Created by gb on 8/31/15.
 */
@ReportsCrashes(mailTo = "reports@yourdomain.com",
        mode = ReportingInteractionMode.TOAST,
        resToastText = R.string.crash_toast_text)
public class AwsTrainingApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        ACRA.init(this);
    }
}
