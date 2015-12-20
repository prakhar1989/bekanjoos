package bekanjoos.vinaygaba.com.bekanjoos;

/**
 * Created by vinaygaba on 12/5/15.
 */
public class Product {
    String title;
    String price;
    String site;

    public String getPid() {
        return pid;
    }

    public void setPid(String pid) {
        this.pid = pid;
    }

    String url;
    String image_url;
    String pid;


    public Product(String pid,String title, String price, String site, String url,String image_url) {
        this.title = title;
        this.price = price;
        this.site = site;
        this.url = url;
        this.image_url = image_url;
        this.pid = pid;
    }

    public Product(String image_url) {
        this.image_url = image_url;
    }

    public String getImage_url() {
        return image_url;

    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
