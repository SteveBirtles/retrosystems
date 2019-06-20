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

import static Controllers.Image.allImages;
import static Controllers.Manufacturer.listManufacturers;

@SuppressWarnings("unchecked")
@Path("system/")
public class RetroSystem {

    @SuppressWarnings("Duplicates")
    private static JSONObject systemFromResultSet(ResultSet results) throws SQLException {

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
    ...
    ------------------------------------------------------*/
    public static String getSystemNameFromId(int id) throws SQLException {

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
            throw new SQLException("Can't find system with id " + id);
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
            response.put("manufacturers", listManufacturers());
            response.put("images", allImages());

            return response.toString();

        } catch (SQLException resultsException) {

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
                    throw new SQLException("Can't find system with id " + id);
                }

            }

            response.put("manufacturers", listManufacturers());
            response.put("images", allImages());

            return response.toString();

        } catch (SQLException resultsException) {

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
    public String saveSystem(@FormDataParam("id") int id,
                             @FormDataParam("manufacturerId") int manufacturerId,
                             @FormDataParam("name") String name,
                             @FormDataParam("mediaType") String mediaType,
                             @FormDataParam("year") String year,
                             @FormDataParam("sales") String sales,
                             @DefaultValue("false") @FormDataParam("handheld") String handheld,
                             @FormDataParam("imageURL") String imageURL,
                             @FormDataParam("notes") String notes,
                             @CookieParam("sessionToken") Cookie sessionCookie) {

        try {

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

        } catch (SQLException resultsException) {
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
    public String deleteSystem(@FormDataParam("id") int id, @CookieParam("sessionToken") Cookie sessionCookie) {

        System.out.println("/system/delete id=" + id + " - Deleting system from database.");

        try {

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

        } catch (SQLException resultsException) {

            String error = "Database error - can't delete by id from 'Systems' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";

        }

    }

}
