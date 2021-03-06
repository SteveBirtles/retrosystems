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

@SuppressWarnings("unchecked")
@Path("system/")
public class RetroSystem {

    /*-------------------------------------------------------
    This method avoids have code duplicated in listSystem
    and getSystem. It creates a JSON object from the next
    item in a database results set.
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    private static JSONObject systemFromResultSet(ResultSet results) throws Exception {

        JSONObject system = new JSONObject();

        system.put("id", results.getInt("SystemId"));
        system.put("manufacturerId", results.getInt("ManufacturerId"));
        system.put("name", results.getString("Name"));
        system.put("mediaType", results.getString("MediaType"));
        system.put("year", results.getString("Year"));
        system.put("sales", results.getString("Sales"));
        system.put("handheld", results.getBoolean("Handheld"));
        system.put("notes", results.getString("Notes"));

        String imageURL = results.getString("ImageURL");
        if (imageURL.equals("NULL")) {
            system.put("imageURL", "/client/img/-none-.png");
        } else {
            system.put("imageURL", imageURL);
        }

        return system;

    }

    /*-------------------------------------------------------
    A handy little method to get the name of a system from it's Id.
    ------------------------------------------------------*/
    public static String getSystemNameFromId(int id) throws Exception {

        PreparedStatement systemStatement = Main.db.prepareStatement(
                "SELECT Name FROM Systems WHERE SystemId = ?"
        );

        systemStatement.setInt(1, id);
        ResultSet systemResults = systemStatement.executeQuery();

        String systemName = null;
        if (systemResults != null && systemResults.next()) {
            systemName = systemResults.getString("Name");
        }

        if (systemName == null) {
            throw new Exception("Can't find system with id " + id);
        }

        return systemName;

    }

    /*-------------------------------------------------------
    The API request handler for /system/list
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    public String listSystems() {

        System.out.println("/system/list - Getting all systems from database");

        String error;
        JSONObject response = new JSONObject();

        try {

            PreparedStatement statement = Main.db.prepareStatement(
                    "SELECT SystemId, ManufacturerId, Name, MediaType, Year, Sales, Handheld, ImageURL, Notes FROM Systems"
            );

            ResultSet results = statement.executeQuery();

            JSONArray systemList = new JSONArray();
            while (results != null && results.next()) {
                systemList.add(systemFromResultSet(results));
            }
            response.put("systems", systemList);

            return response.toString();

        } catch (Exception resultsException) {

            error = "Database error - can't select all from 'Systems' table: " + resultsException.getMessage();

        }

        System.out.println(error);
        return "{'error': '" + error + "'}";

    }

    /*-------------------------------------------------------
    The API request handler for /system/get/{id}
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("get/{id}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String getSystem(@PathParam("id") int id) {

        System.out.println("/system/get/" + id + " - Getting system details from database");

        String error;

        try {

            JSONObject response = new JSONObject();

            if (id != -1) {

                PreparedStatement statement = Main.db.prepareStatement(
                        "SELECT SystemId, ManufacturerId, Name, MediaType, Year, Sales, Handheld, ImageURL, Notes FROM Systems " +
                                "WHERE SystemId = ?"
                );

                statement.setInt(1, id);
                ResultSet results = statement.executeQuery();

                JSONObject system = null;
                if (results != null && results.next()) {
                    system = systemFromResultSet(results);
                }

                if (system != null) {
                    response.put("system", system);
                } else {
                    throw new Exception("Can't find system with id " + id);
                }

            }

            return response.toString();

        } catch (Exception resultsException) {

            error = "Database error - can't select by id from 'Systems' table: " + resultsException.getMessage();

        }

        System.out.println(error);
        return "{'error': '" + error + "'}";

    }

    /*-------------------------------------------------------
    The API request handler for /system/save
        FormDataParams: id, manufacturerId, name, mediaType, year, sales, handheld, imageURL, notes
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("save")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String saveSystem(@FormDataParam("id") Integer id,
                             @FormDataParam("manufacturerId") Integer manufacturerId,
                             @FormDataParam("name") String name,
                             @FormDataParam("mediaType") String mediaType,
                             @FormDataParam("year") String year,
                             @FormDataParam("sales") String sales,
                             @DefaultValue("false") @FormDataParam("handheld") String handheld,
                             @FormDataParam("imageURL") String imageURL,
                             @FormDataParam("notes") String notes,
                             @CookieParam("sessionToken") String sessionCookie) {

        try {

            if (id == null ||
                    manufacturerId == null ||
                    name == null ||
                    mediaType == null ||
                    year == null ||
                    sales == null ||
                    handheld == null ||
                    imageURL == null ||
                    notes == null) {
                throw new Exception("One or more form data parameters are missing in the HTTP request.");
            }

            System.out.println("/system/save id=" + id + " - Saving system to database.");

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            if (id == -1) {
                statement = Main.db.prepareStatement(
                        "INSERT INTO Systems (ManufacturerId, Name, MediaType, Year, Sales, Handheld, ImageURL, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                );
            } else {
                statement = Main.db.prepareStatement(
                        "UPDATE Systems SET ManufacturerId = ?, Name = ?, MediaType = ?, Year = ?, Sales = ?, Handheld = ?, ImageURL = ?, Notes = ? WHERE SystemId = ?"
                );
            }

            statement.setInt(1, manufacturerId);
            statement.setString(2, name);
            statement.setString(3, mediaType);
            statement.setString(4, year);
            statement.setString(5, sales);
            statement.setBoolean(6, handheld.toLowerCase().equals("true") || handheld.toLowerCase().equals("on"));
            statement.setString(7, imageURL);
            statement.setString(8, notes);

            if (id != -1) {
                statement.setInt(9, id);
            }

            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (Exception resultsException) {
            String error = "Database error - can't insert/update 'Systems' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }
    }

    /*-------------------------------------------------------
    The API request handler for /system/delete
        FormDataParams: id
        Cookies: sessionToken
    ------------------------------------------------------*/
    @POST
    @Path("delete")
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteSystem(@FormDataParam("id") Integer id,
                               @CookieParam("sessionToken") String sessionCookie) {

        try {

            if (id == null) {
                throw new Exception("One or more form data parameters are missing in the HTTP request.");
            }

            System.out.println("/system/delete id=" + id + " - Deleting system from database.");

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement = Main.db.prepareStatement(
                    "DELETE FROM Systems WHERE SystemId = ?"
            );
            statement.setInt(1, id);
            statement.executeUpdate();
            return "{\"status\": \"OK\"}";

        } catch (Exception resultsException) {

            String error = "Database error - can't delete by id from 'Systems' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";

        }

    }

}
