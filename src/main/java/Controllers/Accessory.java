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

import static Controllers.RetroSystem.getSystemNameFromId;

@SuppressWarnings("unchecked")
@Path("accessory/")
public class Accessory {

    /*-------------------------------------------------------
    This method avoids have code duplicated in listAccessory
    and getAccessory. It creates a JSON object from the next
    item in a database results set.
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    private static JSONObject accessoryFromResultSet(ResultSet results) throws Exception {

        JSONObject accessory = new JSONObject();

        accessory.put("id", results.getInt("AccessoryId"));
        accessory.put("categoryId", results.getInt("CategoryId"));
        accessory.put("systemId", results.getInt("SystemId"));
        accessory.put("description", results.getString("Description"));
        accessory.put("quantity", results.getInt("Quantity"));
        accessory.put("thirdParty", results.getBoolean("ThirdParty"));

        String imageURL = results.getString("ImageURL");
        if (imageURL.equals("NULL")) {
            accessory.put("imageURL", "/client/img/-none-.png");
        } else {
            accessory.put("imageURL", imageURL);
        }

        return accessory;

    }

    /*-------------------------------------------------------
    The API request handler for /accessory/list/{id}
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("list/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String listAccessories(@PathParam("id") int id) {

        System.out.println("/accessory/list/" + id + " - Getting all accessories from database");

        String error;
        JSONObject response = new JSONObject();

        try {

            String systemName = getSystemNameFromId(id);
            response.put("systemName", systemName);

            PreparedStatement accessoryStatement = Main.db.prepareStatement(
                    "SELECT AccessoryId, CategoryId, SystemId, Description, Quantity, ThirdParty, ImageURL FROM Accessories " +
                            "WHERE SystemId = ? ORDER BY Description"
            );

            accessoryStatement.setInt(1, id);
            ResultSet accessoryResults = accessoryStatement.executeQuery();

            JSONArray accessoryList = new JSONArray();
            while (accessoryResults != null && accessoryResults.next()) {
                accessoryList.add(accessoryFromResultSet(accessoryResults));
            }

            response.put("accessories", accessoryList);

            return response.toString();

        } catch (Exception resultsException) {

            error = "Database error - can't select all from 'Accessories' table: " + resultsException.getMessage();

        }

        System.out.println(error);
        return "{'error': '" + error + "'}";

    }

    /*-------------------------------------------------------
    The API request handler for /accessory/get/{id}
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("get/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getAccessory(@PathParam("id") int id) {

        System.out.println("/accessory/get/" + id + " - Getting accessory details from database");

        String error;

        try {

            JSONObject response = new JSONObject();

            if (id != -1) {

                PreparedStatement statement = Main.db.prepareStatement(
                        "SELECT AccessoryId, CategoryId, SystemId, Description, Quantity, ThirdParty, ImageURL FROM Accessories " +
                                "WHERE AccessoryId = ?"
                );

                statement.setInt(1, id);
                ResultSet results = statement.executeQuery();

                JSONObject accessory = null;
                if (results != null && results.next()) {
                    accessory = accessoryFromResultSet(results);
                }

                if (accessory != null) {
                    response.put("accessory", accessory);
                } else {
                    throw new Exception("Can't find accessory with id " + id);

                }
            }

            return response.toString();

        } catch (Exception resultsException) {

            error = "Database error - can't select by id from 'Accessories' table: " + resultsException.getMessage();

        }

        System.out.println(error);
        return "{'error': '" + error + "'}";
    }

    /*-------------------------------------------------------
    The API request handler for /accessory/save
        FormDataParams: id, categoryId, systemId, description, quantity, thirdParty, imageURL
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("save")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String saveAccessory(  @FormDataParam("id") Integer id,
                                  @FormDataParam("categoryId") Integer categoryId,
                                  @FormDataParam("systemId") Integer systemId,
                                  @FormDataParam("description") String description,
                                  @FormDataParam("quantity") Integer quantity,
                                  @DefaultValue("false") @FormDataParam("thirdParty") String thirdParty,
                                  @FormDataParam("imageURL") String imageURL,
                                  @CookieParam("sessionToken") String sessionCookie) {

        try {

            if (id == null ||
                    categoryId == null ||
                    systemId  == null ||
                    description  == null ||
                    quantity  == null ||
                    thirdParty  == null ||
                    imageURL == null) {
                throw new Exception("One or more form data parameters are missing in the HTTP request.");
            }

            System.out.println("/accessory/save id=" + id + " - Saving accessory to database");

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            if (id == -1) {
                statement = Main.db.prepareStatement(
                        "INSERT INTO Accessories (CategoryId, SystemId, Description, Quantity, ThirdParty, ImageURL) VALUES (?, ?, ?, ?, ?, ?)"
                );
            } else {
                statement = Main.db.prepareStatement(
                        "UPDATE Accessories SET CategoryId = ?, SystemId = ?, Description = ?, Quantity = ?, ThirdParty = ?, ImageURL = ? WHERE AccessoryId = ?"
                );
            }

            statement.setInt(1, categoryId);
            statement.setInt(2, systemId);
            statement.setString(3, description);
            statement.setInt(4, quantity);
            statement.setBoolean(5, thirdParty.toLowerCase().equals("true") || thirdParty.toLowerCase().equals("on"));
            statement.setString(6, imageURL);

            if (id != -1) {
                statement.setInt(7, id);
            }

            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (Exception resultsException) {
            String error = "Database error - can't insert/update 'Accessories' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    /*-------------------------------------------------------
    The API request handler for /accessory/delete
        FormDataParams: id
        Cookies: sessionToken
    ------------------------------------------------------*/
    @POST
    @Path("delete")
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteSoftware(@FormDataParam("id") Integer id,
                                 @CookieParam("sessionToken") String sessionCookie) {

        try {

            if (id == null) {
                throw new Exception("One or more form data parameters are missing in the HTTP request.");
            }

            System.out.println("/accessory/delete id=" + id + " - Deleting Software from database");

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement = Main.db.prepareStatement(
                    "DELETE FROM Accessories WHERE AccessoryId = ?"
            );
            statement.setInt(1, id);
            statement.executeUpdate();
            return "{\"status\": \"OK\"}";

        } catch (Exception resultsException) {

            String error = "Database error - can't delete by id from 'Accessory' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";

        }

    }

}