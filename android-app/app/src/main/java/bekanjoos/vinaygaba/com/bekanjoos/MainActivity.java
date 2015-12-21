package bekanjoos.vinaygaba.com.bekanjoos;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.Toolbar;
import android.support.v7.widget.helper.ItemTouchHelper;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.Toast;

import com.facebook.FacebookSdk;
import com.facebook.login.LoginManager;
import com.squareup.okhttp.MediaType;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.RequestBody;
import com.squareup.okhttp.Response;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import retrofit.GsonConverterFactory;
import retrofit.Retrofit;


public class MainActivity extends AppCompatActivity {

    public static final String LOG_TAG = "MainActivity";
    public static final String BASE_URL = "http://api.bekanjoos.co";
    private static RecyclerView mRecyclerView;
    ImageView emptyView;
    private RecyclerView.Adapter mAdapter;
    private RecyclerView.LayoutManager mLayoutManager;
    private SwipeRefreshLayout swipeRefreshLayout;
    static ArrayList<Product> productList;
    Retrofit retrofit;
    RetrofitEndpoints endpoint;
    String id="";
    SharedPreferences prefs;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FacebookSdk.sdkInitialize(getApplicationContext());
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        mRecyclerView = (RecyclerView) findViewById(R.id.my_recycler_view);
        prefs = getSharedPreferences("BeKanjoos",MODE_PRIVATE);
        id = prefs.getString("id", "");
        Log.e("id",id);
        swipeRefreshLayout = (SwipeRefreshLayout)findViewById(R.id.swiperefresh);
        emptyView = (ImageView)findViewById(R.id.emptyView);
        // use a linear layout manager
        mLayoutManager = new LinearLayoutManager(this);
        mRecyclerView.setLayoutManager(mLayoutManager);
        productList = new ArrayList<Product>();

        mAdapter = new CustomAdapter(productList,getApplicationContext(),id);
        mRecyclerView.setAdapter(mAdapter);


        loadProducts();

        //Swipe to Dismiss
        ItemTouchHelper.SimpleCallback simpleItemTouchCallback = new ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {

            @Override
            public boolean onMove(RecyclerView recyclerView, RecyclerView.ViewHolder viewHolder, RecyclerView.ViewHolder target) {
                return false;
            }

            @Override
            public void onSwiped(RecyclerView.ViewHolder viewHolder, int swipeDir) {
                //Remove swiped item from list and notify the RecyclerView
                Product product = new Product("id");
                int position = viewHolder.getAdapterPosition();

                deleteProduct(productList.get(position).getPid(),productList.get(position).getSite());
                productList.remove(position);
                mAdapter.notifyDataSetChanged();
            }
        };

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(simpleItemTouchCallback);
        itemTouchHelper.attachToRecyclerView(mRecyclerView);


        retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        // prepare call in Retrofit 2.0
        endpoint = retrofit.create(RetrofitEndpoints.class);

        /*
        * Sets up a SwipeRefreshLayout.OnRefreshListener that is invoked when the user
        * performs a swipe-to-refresh gesture.
        */
        swipeRefreshLayout.setOnRefreshListener(
                new SwipeRefreshLayout.OnRefreshListener() {
                    @Override
                    public void onRefresh() {
                        Log.i(LOG_TAG, "onRefresh called from SwipeRefreshLayout");

                        // This method performs the actual data-refresh operation.
                        // The method calls setRefreshing(false) when it's finished.
                        loadProducts();
                    }
                }
        );

    }

    /**
     * Method to load products from the API
     */
    private void loadProductsRetrofit() {
//        Log.e("Id",id);


/*
        Call<ArrayList<Product>> call = endpoint.getProducts("10153409653401025");

        call.enqueue(new Callback<ArrayList<Product>>() {
            @Override
            public void onResponse(Response<ArrayList<Product>> response, Retrofit retrofit) {
                Log.e("Response",response.raw().toString());
               // Log.e("Response",response.body().toString());
                productList = response.body();
//                Log.e("Product List Size",productList.size()+"");
                mAdapter.notifyDataSetChanged();
                swipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public void onFailure(Throwable t) {
                swipeRefreshLayout.setRefreshing(false);

            }
        });*/


    }

    public void loadProducts(){

        final ArrayList<Product> prodList = new ArrayList<Product>();
        String url = BASE_URL + "/api/user/" + id + "/products";
        OkHttpClient client = new OkHttpClient();


        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new com.squareup.okhttp.Callback() {
            @Override
            public void onFailure(Request request, IOException e) {

            }

            @Override
            public void onResponse(Response response) throws IOException {

                try {
                    JSONObject jsonObject = new JSONObject(response.body().string());

                    JSONArray jsonArray = jsonObject.getJSONArray("products");

                    for(int i=0; i<jsonArray.length();i++){
                        JSONObject jObj = (JSONObject)jsonArray.get(i);
                        Log.e("Title",jObj.get("title").toString());
                        Product product = new Product(jObj.get("pid").toString(),jObj.get("title").toString(),jObj.get("price").toString(),jObj.get("site").toString(),jObj.get("url").toString(),jObj.get("image_url").toString());
                        prodList.add(product);
                    }

                }
                catch(Exception e){
                    e.printStackTrace();
                }
                //Log.e("Response",response.body().string());

                productList = prodList;



                //Log.e("Size",productList.size()+"");
                new Handler(Looper.getMainLooper()).post(new Runnable() {

                    @Override
                    public void run() {
                        // your ui code here
                        mAdapter = new CustomAdapter(productList,getApplicationContext(),id);
                        mRecyclerView.setAdapter(mAdapter);
                        mAdapter.notifyDataSetChanged();
                        if(productList.isEmpty()){
                            mRecyclerView.setVisibility(View.GONE);
                            emptyView.setVisibility(View.VISIBLE);
                        } else{
                            mRecyclerView.setVisibility(View.VISIBLE);
                            emptyView.setVisibility(View.GONE);
                        }
                        swipeRefreshLayout.setRefreshing(false);
                    }
                });

            }
        });

       // mAdapter.notifyDataSetChanged();

    }

    /**
     * Method to delete a product from a user's list
     * @param product
     */
    private void deleteProductRetrofit(Product product) {

        /*
        Call<String> call = endpoint.deleteProduct("product_id");
        call.enqueue(new Callback<String>() {
            @Override
            public void onResponse(Response<String> response, Retrofit retrofit) {

            }

            @Override
            public void onFailure(Throwable t) {

            }
        });
    */

    }

    private void deleteProduct(String product_id,String site){
        String url = BASE_URL + "/api/user/" + id + "/product";
        OkHttpClient client = new OkHttpClient();
        final MediaType JSON
                = MediaType.parse("application/json; charset=utf-8");
        String jsonString = "{\"site\":\"" +site+"\",\"product_id\":\"" + product_id+ "\""+ "}";
        RequestBody requestBody = RequestBody.create(JSON,jsonString);

        Request request = new Request.Builder()
                .url(url)
                .method("DELETE",requestBody)
                .build();

        client.newCall(request).enqueue(new com.squareup.okhttp.Callback() {
            @Override
            public void onFailure(Request request, IOException e) {
                Log.e("Failure","Happened");
            }

            @Override
            public void onResponse(Response response) throws IOException {
                Log.e("Response",response.body().string());
            }
        });
    }

    private void populateProducts() {

       // Product p1 = new Product("Hill's Adult Oral Care","$21.59","Amazon","http://ecx.images-amazon.com/images/I/51jx7n5KIFL._SY300_.jpg");
       // Product p2 = new Product("Samsung Galaxy 5","Rs. 20,000","Flipkart","http://s.tmocache.com/content/dam/tmo/en-p/cell-phones/samsung-galaxy-s-5/charcoal-black/stills/carousel-samsung-galaxy-s-5-charcoal-black-380x380-1.jpg");
       // Product p3 = new Product("Sony Playstation 4","$ 349.99","BestBuy","http://cdn2.ubergizmo.com/wp-content/uploads/2015/06/sony-ps4-640x360.jpg");
       // Product p4 = new Product("Joe Black Wayfarer","$199","Amazon","http://stat.homeshop18.com/homeshop18/images/productImages/921/joe-black-unisex-wayfarer-sunglasses-black-medium_a832884383553c32ed3e25401a63c733.jpg");

//        productList.add(p1);
//        productList.add(p2);
//        productList.add(p3);
//        productList.add(p4);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_logout) {

            LoginManager.getInstance().logOut();


            Intent intent = new Intent(MainActivity.this,LoginActivity.class);
            startActivity(intent);
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    public static class ItemClickListener implements View.OnClickListener{

        Context context;
        String id;

        ItemClickListener(Context context,String id){
            this.context = context;
            this.id = id;
        }

        @Override
        public void onClick(View view) {
            int position = mRecyclerView.indexOfChild(view);
            Toast.makeText(context,"Pos "+position,Toast.LENGTH_LONG).show();
            Product product = productList.get(position);

            Intent intent = new Intent(context.getApplicationContext(),DetailActivity.class);
            intent.putExtra("id",id);
            intent.putExtra("product_name",product.getTitle());
            intent.putExtra("url",product.getUrl());
            intent.putExtra("price",product.getPrice());
            intent.putExtra("image",product.getImage_url());
            intent.putExtra("website",product.getSite());
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);


        }
    }

    @Override
    public void onBackPressed() {
        //super.onBackPressed();
    }
}


