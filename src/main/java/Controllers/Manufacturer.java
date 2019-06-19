package Controllers;

import Server.Main;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@SuppressWarnings("unchecked")
@Path("manufacturer/")
public class Manufacturer {

    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    public String listManufacturersForConfig(@CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {
        String error;
        try {

            System.out.println("/manufacturer/list - Getting all manufacturers from database");

            PreparedStatement statement = Main.db.prepareStatement(
                    "SELECT m.ManufacturerId, m.Name, " +
                            "(SELECT COUNT(*) FROM Systems s WHERE s.ManufacturerId = m.ManufacturerId) AS 'Count' " +
                            "FROM Manufacturers m ORDER BY m.Name"
            );

            ResultSet results = statement.executeQuery();

            JSONArray list = new JSONArray();
            while (results != null && results.next()) {
                JSONObject manufacturer = new JSONObject();
                manufacturer.put("manufacturerId", results.getInt("ManufacturerId"));
                manufacturer.put("name", results.getString("Name"));
                manufacturer.put("count", results.getString("Count"));
                list.add(manufacturer);
            }

            return list.toString();
        } catch (SQLException resultsException) {
            error = "Database error - can't select all from 'Manufacturers' table: " + resultsException.getMessage();
        }
        System.out.println(error);
        return "{'error': '" + error + "'}";
    }

    public static JSONArray listManufacturers(@CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) throws SQLException {

        System.out.println("/manufacturer/list - Getting all manufacturers from database");

        PreparedStatement statement = Main.db.prepareStatement(
                "SELECT ManufacturerId, Name FROM Manufacturers ORDER BY Name"
        );

        ResultSet results = statement.executeQuery();

        JSONArray list = new JSONArray();
        while (results != null && results.next()) {
            JSONObject manufacturer = new JSONObject();
            manufacturer.put("manufacturerId", results.getInt("ManufacturerId"));
            manufacturer.put("name", results.getString("Name"));
            list.add(manufacturer);
        }

        return list;

    }

    @SuppressWarnings("Duplicates")
    @POST
    @Path("new")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String addManufacturer(  @FormDataParam("name") String name,
                                    @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/manufacturer/new name=" + name + " - Adding manufacturer to database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
                statement = Main.db.prepareStatement("INSERT INTO Manufacturers (Name) VALUES (?)");
            statement.setString(1, name);
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't insert into 'Manufacturers' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    @SuppressWarnings("Duplicates")
    @POST
    @Path("rename")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String renameManufacturer(  @FormDataParam("id") String id, @FormDataParam("name") String name,
                                       @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/manufacturer/rename id=" + id + " name=" + name + " - Renaming manufacturer in database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("UPDATE Manufacturers SET Name = ? WHERE ManufacturerId = ?");
            statement.setString(1, name);
            statement.setString(2, id);
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't update 'Manufacturers' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    @SuppressWarnings("Duplicates")
    @POST
    @Path("delete")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteManufacturer(  @FormDataParam("id") String id,
                                       @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/manufacturer/delete/" + id + " - Deleting manufacturer from database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("DELETE FROM Manufacturers WHERE ManufacturerId = ?");
            statement.setString(1, id);
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't delete from 'Manufacturers' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

}
