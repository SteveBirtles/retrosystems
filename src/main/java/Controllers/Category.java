package Controllers;

import Server.Main;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@SuppressWarnings("unchecked")
@Path("category/")
public class Category {

    /*-------------------------------------------------------
    The API request handler for /category/list
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    public String listCategories() {
        String error;
        try {

            System.out.println("/category/list - Getting all categories from database");

            PreparedStatement statement = Main.db.prepareStatement(
                    "SELECT c.CategoryId, c.Name, " +
                            "(SELECT COUNT(*) FROM Accessories a WHERE a.CategoryId = c.CategoryId) AS 'Count' " +
                            "FROM Categories c ORDER BY c.Name"
            );

            ResultSet results = statement.executeQuery();

            JSONArray list = new JSONArray();
            while (results != null && results.next()) {
                JSONObject category = new JSONObject();
                category.put("categoryId", results.getInt("CategoryId"));
                category.put("name", results.getString("Name"));
                category.put("count", results.getString("Count"));
                list.add(category);
            }

            return list.toString();
        } catch (SQLException resultsException) {
            error = "Database error - can't select all from 'Categories' table: " + resultsException.getMessage();
        }
        System.out.println(error);
        return "{'error': '" + error + "'}";
    }

    /*-------------------------------------------------------
    The API request handler for /category/new
        FormDataParams: name
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("new")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String addCategory(  @FormDataParam("name") String name,
                                @CookieParam("sessionToken") Cookie sessionCookie) {

        System.out.println("/category/new name=" + name + " - Adding category to database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("INSERT INTO Categories (Name) VALUES (?)");
            statement.setString(1, name);
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't insert into 'Categories' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    /*-------------------------------------------------------
    The API request handler for /category/rename
        FormDataParams: id, name
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("rename")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String renameCategory(  @FormDataParam("id") String id, @FormDataParam("name") String name,
                                   @CookieParam("sessionToken") Cookie sessionCookie) {

        System.out.println("/category/rename id=" + id + " name=" + name + " - Renaming category in database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("UPDATE Categories SET Name = ? WHERE CategoryId = ?");
            statement.setString(1, name);
            statement.setString(2, id);
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't update 'Categories' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    /*-------------------------------------------------------
    The API request handler for /category/delete
        FormDataParams: id
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("delete")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteCategory(@FormDataParam("id") String id,
                                   @CookieParam("sessionToken") Cookie sessionCookie) {

        System.out.println("/category/delete id=" + id + " - Deleting category from database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("DELETE FROM Categories WHERE CategoryId = ?");
            statement.setString(1, id);
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't delete from 'Categories' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }
}
