package bekanjoos.vinaygaba.com.bekanjoos;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.support.annotation.Nullable;

import com.github.paolorotolo.appintro.AppIntro;
import com.github.paolorotolo.appintro.AppIntroFragment;

/**
 * Created by vinaygaba on 12/20/15.
 */
public class Intro extends AppIntro {
    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;
    public static final String APP_TAG = "BeKanjoos";
    @Override
    public void init(@Nullable Bundle savedInstanceState) {
        sharedPreferences = getSharedPreferences(APP_TAG,MODE_PRIVATE);
        editor = sharedPreferences.edit();

        boolean isFirstStart = sharedPreferences.getBoolean("firstStart", true);

        if(isFirstStart) {

            addSlide(AppIntroFragment.newInstance(getResources().getString(R.string.intro1string), getResources().getString(R.string.intro1descstring), R.drawable.track, getResources().getColor(R.color.intro1)));
            addSlide(AppIntroFragment.newInstance(getResources().getString(R.string.intro2string), getResources().getString(R.string.intro2descstring), R.drawable.cart, getResources().getColor(R.color.intro2)));
            addSlide(AppIntroFragment.newInstance(getResources().getString(R.string.intro3string), getResources().getString(R.string.intro3descstring), R.drawable.clock, getResources().getColor(R.color.intro3)));
            addSlide(AppIntroFragment.newInstance(getResources().getString(R.string.intro4string), getResources().getString(R.string.intro4descstring), R.drawable.beakercopy, getResources().getColor(R.color.intro4)));
        }
        else{
            Intent intent = new Intent(Intro.this,LoginActivity.class);
            startActivity(intent);
        }
    }

    @Override
    public void onSkipPressed() {

        editor.putBoolean("firstStart",false);
        editor.commit();

        Intent intent = new Intent(Intro.this,LoginActivity.class);
        startActivity(intent);

    }

    @Override
    public void onNextPressed() {



    }

    @Override
    public void onDonePressed() {

        editor.putBoolean("firstStart",false);
        editor.commit();

        Intent intent = new Intent(Intro.this,LoginActivity.class);
        startActivity(intent);

    }

    @Override
    public void onSlideChanged() {

    }


}
