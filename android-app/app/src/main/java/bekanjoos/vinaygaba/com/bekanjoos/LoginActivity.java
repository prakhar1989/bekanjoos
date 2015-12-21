package bekanjoos.vinaygaba.com.bekanjoos;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.FacebookSdk;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;

import org.json.JSONObject;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class LoginActivity extends AppCompatActivity {

    CallbackManager callbackManager;
    LoginButton loginButton;
    AccessToken accessToken;
    SharedPreferences.Editor editor;
    SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FacebookSdk.sdkInitialize(getApplicationContext());
        setContentView(R.layout.activity_login);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        prefs = getSharedPreferences("BeKanjoos",MODE_PRIVATE);
        editor = prefs.edit();

        setSupportActionBar(toolbar);

        callbackManager = CallbackManager.Factory.create();
        loginButton = (LoginButton) findViewById(R.id.login_button);

        boolean loggedIn = AccessToken.getCurrentAccessToken() != null;

        if(loggedIn){
            Intent intent = new Intent(LoginActivity.this,MainActivity.class);
            startActivity(intent);
        }

        // Callback registration
        loginButton.registerCallback(callbackManager, new FacebookCallback<LoginResult>() {
            @Override
            public void onSuccess(LoginResult loginResult) {
                accessToken = loginResult.getAccessToken();

                Toast.makeText(getApplicationContext(),loginResult.getAccessToken().getUserId(),Toast.LENGTH_LONG).show();

                String id = prefs.getString("id","");
                if(id.equals("")) {
                    Log.e("Getting User Details","");
                    getUserDetails();
                }
                else{
                    Intent intent = new Intent(LoginActivity.this,MainActivity.class);
                    startActivity(intent);
                }

            }

            @Override
            public void onCancel() {
                // App code
            }

            @Override
            public void onError(FacebookException exception) {
                // App code
            }
        });



    }

    private void getUserDetails() {

        GraphRequest request = GraphRequest.newMeRequest(
                accessToken,
                new GraphRequest.GraphJSONObjectCallback() {
                    @Override
                    public void onCompleted(
                            JSONObject object,
                            GraphResponse response) {
                        String id = "";
                        String name = "";

                        try {
                            id = object.getString("id");
                            Log.e("ID",id);
                            name = object.getString("name");
                        }
                        catch (Exception e){

                        }

                        editor.putString("id", id);
                        editor.putString("name", name);
                        editor.commit();
                        // App code
                        Intent intent = new Intent(LoginActivity.this,MainActivity.class);
                        startActivity(intent);

                    }
                });
        Bundle parameters = new Bundle();
        parameters.putString("fields", "id,name,email");
        request.setParameters(parameters);
        request.executeAsync();

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        callbackManager.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        //super.onBackPressed();
    }
}
