package bekanjoos.vinaygaba.com.bekanjoos;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.squareup.picasso.Picasso;

import java.util.ArrayList;

/**
 * Created by vinaygaba on 12/5/15.
 */
class CustomAdapter extends RecyclerView.Adapter<CustomAdapter.ViewHolder> {
    private ArrayList<Product> productList;
    Context context;
    MainActivity.ItemClickListener itemClickListener;

    // Provide a reference to the views for each data item
    // Complex data items may need more than one view per item, and
    // you provide access to all the views for a data item in a view holder
    public static class ViewHolder extends RecyclerView.ViewHolder {
        // each data item is just a string in this case
        public TextView productName;
        public TextView price;
        public TextView website;
        public ImageView imageView;

        public ViewHolder(View v) {
            super(v);

        }
    }

    // Provide a suitable constructor (depends on the kind of dataset)
    public CustomAdapter(ArrayList<Product> productList, Context context,String id) {
        this.productList = productList;
        Log.e("Adapter size",productList.size()+"");
        this.context = context;
        itemClickListener = new MainActivity.ItemClickListener(context,id);
    }

    // Create new views (invoked by the layout manager)
    @Override
    public CustomAdapter.ViewHolder onCreateViewHolder(ViewGroup parent,
                                                       int viewType) {
        // create a new view
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_row, parent, false);

        v.setOnClickListener(itemClickListener);
        // set the view's size, margins, paddings and layout parameters

        ViewHolder vh = new ViewHolder(v);
        vh.productName = (TextView)v.findViewById(R.id.productName);
        vh.price = (TextView)v.findViewById(R.id.price);
        vh.website = (TextView)v.findViewById(R.id.website);
        vh.imageView=(ImageView)v.findViewById(R.id.image);

        return vh;
    }

    // Replace the contents of a view (invoked by the layout manager)
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        // - get element from your dataset at this position
        // - replace the contents of the view with that element

        holder.productName.setText(productList.get(position).getTitle());
        holder.price.setText(productList.get(position).getPrice());
        holder.website.setText("on " + productList.get(position).getSite());
        int resID = context.getResources().getIdentifier("test", "drawable", "bekanjoos.vinaygaba.com.bekanjoos");
        //holder.imageView.setImageResource(resID);

        Picasso.with(context)
                .load(productList.get(position).getImage_url())
                .resize(50, 50)
                .into(holder.imageView);
    }

    // Return the size of your dataset (invoked by the layout manager)
    @Override
    public int getItemCount() {
        return productList.size();
    }
}