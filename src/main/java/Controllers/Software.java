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
import static Controllers.RetroSystem.getSystemNameFromId;

@SuppressWarnings("unchecked")
@Path("software/")
public class Software {

    @SuppressWarnings("Duplicates")
    private static JSONObject softwareFromResultSet(ResultSet results) throws SQLException {

        JSONObject software = new JSONObject();

        software.put("id", results.getInt("SoftwareId"));
        software.put("systemId", results.getInt("SystemId"));
        software.put("name", results.getString("Name"));
        software.put("sales", results.getString("Sales"));
        software.put("year", results.getString("Year"));
        software.put("imageURL", results.getString("ImageURL"));

        String imageURL = results.getString("ImageURL");
        if (imageURL.equals("NULL")) {
            software.put("imageURL", "/client/img/-none-.png");
        } else {
            software.put("imageURL", imageURL);
        }

        return software;

    }

    /*-------------------------------------------------------
    The API request handler for /software/list/{id}
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("list/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String listSoftware(@PathParam("id") int id) {

        System.out.println("/software/list/" + id + " - Getting all software from database");

        String error;
        JSONObject response = new JSONObject();

        try {

            String systemName = getSystemNameFromId(id);
            response.put("systemName", systemName);

            PreparedStatement softwareStatement = Main.db.prepareStatement(
                    "SELECT SoftwareId, SystemId, Name, Sales, Year, ImageURL FROM Software " +
                            "WHERE SystemId = ? ORDER BY Name"
            );

            softwareStatement.setInt(1, id);
            ResultSet softwareResults = softwareStatement.executeQuery();

            JSONArray softwareList = new JSONArray();
            while (softwareResults != null && softwareResults.next()) {
                softwareList.add(softwareFromResultSet(softwareResults));
            }

            response.put("software", softwareList);

            return response.toString();

        } catch (SQLException resultsException) {

            error = "Database error - can't select all from 'Software' table: " + resultsException.getMessage();

        }

        System.out.println(error);
        return "{'error': '" + error + "'}";

    }

    /*-------------------------------------------------------
    The API request handler for /software/get/{id}
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("get/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String getSoftware(@PathParam("id") int id) {

        System.out.println("/software/get/"+ id + " - Getting software details from database");

        String error;

        try {

            JSONObject response = new JSONObject();

            if (id != -1) {

                PreparedStatement statement = Main.db.prepareStatement(
                        "SELECT SoftwareId, SystemId, Name, Sales, Year, ImageURL FROM Software " +
                                "WHERE SoftwareId = ?"
                );

                statement.setInt(1, id);
                ResultSet results = statement.executeQuery();

                JSONObject software = null;
                if (results != null && results.next()) {
                    software = softwareFromResultSet(results);
                }

                if (software != null) {
                    response.put("software", software);
                } else {
                    throw new SQLException("Can't find software with id " + id);
                }

            }

            response.put("images", allImages());

            return response.toString();

        } catch (SQLException resultsException) {

            error = "Database error - can't select by id from 'Software' table: " + resultsException.getMessage();

        }

        System.out.println(error);
        return "{'error': '" + error + "'}";
    }

    /*-------------------------------------------------------
    The API request handler for /software/save
        FormDataParams: id, systemId, name, sales, year, imageURL
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("save")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String saveSoftware( @FormDataParam("id") int id,
                                @FormDataParam("systemId") int systemId,
                                @FormDataParam("name") String name,
                                @FormDataParam("sales") String sales,
                                @FormDataParam("year") String year,
                                @FormDataParam("imageURL") String imageURL,
                                @CookieParam("sessionToken") Cookie sessionCookie) {

        System.out.println("/software/save id=" + id + " - Saving software to database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            if (id == -1) {
                statement = Main.db.prepareStatement(
                        "INSERT INTO Software (SystemId, Name, Sales, Year, ImageURL) VALUES (?, ?, ?, ?, ?)"
                );
            } else {
                statement = Main.db.prepareStatement(
                        "UPDATE Software SET SystemId = ?, Name = ?, Sales = ?, Year = ?, ImageURL = ? WHERE SoftwareId = ?"
                );
            }

            statement.setInt(1, systemId);
            statement.setString(2, name);
            statement.setString(3, sales);
            statement.setString(4, year);
            statement.setString(5, imageURL);

            if (id != -1) {
                statement.setInt(6, id);
            }

            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't insert/update 'Software' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    /*-------------------------------------------------------
    The API request handler for /software/delete
        FormDataParams: id
        Cookies: sessionToken
    ------------------------------------------------------*/
    @POST
    @Path("delete")
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteSoftware(@FormDataParam("id") int id,
                                 @CookieParam("sessionToken") Cookie sessionCookie) {

        System.out.println("/software/delete id=" + id + " - Deleting software from database.");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement = Main.db.prepareStatement(
                    "DELETE FROM Software WHERE SoftwareId = ?"
            );
            statement.setInt(1, id);
            statement.executeUpdate();
            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {

            String error = "Database error - can't delete by id from 'Software' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";

        }

    }

}
