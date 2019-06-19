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
import java.util.UUID;

@SuppressWarnings("unchecked")
@Path("admin/")
public class Admin {

    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    public String listAdminsForConfig(@CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {
        String error;
        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) return "Error: Invalid user session token";

            System.out.println("/admin/list - Getting all admins from database");

            PreparedStatement statement = Main.db.prepareStatement(
                    "SELECT Username FROM Admins"
            );

            ResultSet results = statement.executeQuery();

            JSONArray list = new JSONArray();
            while (results != null && results.next()) {
                JSONObject admin = new JSONObject();
                admin.put("username", results.getString("Username").toLowerCase());
                list.add(admin);
            }

            return list.toString();
        } catch (SQLException resultsException) {
            error = "Database error - can't select all from 'Admins' table: " + resultsException.getMessage();
        }
        System.out.println(error);
        return "{'error': '" + error + "'}";
    }

    public static String validateSessionCookie(Cookie sessionCookie) {
        if (sessionCookie != null) {
            String token = sessionCookie.getValue();
            try {
                PreparedStatement statement = Main.db.prepareStatement(
                        "SELECT Username FROM Admins WHERE SessionToken = ?"
                );
                statement.setString(1, token);
                ResultSet results = statement.executeQuery();
                if (results != null && results.next()) {
                    return results.getString("Username").toLowerCase();
                }
            } catch (SQLException resultsException) {
                String error = "Database error - can't select by id from 'Admins' table: " + resultsException.getMessage();

                System.out.println(error);
            }
        }
        return null;
    }

    @POST
    @Path("login")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String attemptLogin(@FormDataParam("username") String username,
                               @FormDataParam("password") String password,
                               @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/user/login - Attempt by " + username);

        try {
            PreparedStatement statement1 = Main.db.prepareStatement(
                    "SELECT Username, Password, SessionToken FROM Admins WHERE Username = ?"
            );
            statement1.setString(1, username.toLowerCase());
            ResultSet results = statement1.executeQuery();

            if (results != null && results.next()) {
                if (!password.equals(results.getString("Password"))) {
                    return "{\"error\": \"Incorrect password\"}";
                }

                String token = UUID.randomUUID().toString();
                PreparedStatement statement2 = Main.db.prepareStatement(
                        "UPDATE Admins SET SessionToken = ? WHERE LOWER(Username) = ?"
                );
                statement2.setString(1, token);
                statement2.setString(2, username.toLowerCase());
                statement2.executeUpdate();
                return "{\"token\": \"" + token + "\"}";

            } else {
                return "{\"error\": \"Can't find user account.\"}";
            }

        } catch (SQLException resultsException) {
            String error = "Database error - can't process login: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    @GET
    @Path("check")
    @Produces(MediaType.APPLICATION_JSON)
    public String checkLogin(@CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/admin/check - Checking user against database");

        String currentUser = validateSessionCookie(sessionCookie);

        if (currentUser == null) {
            System.out.println("Error: Invalid user session token");
            return "{\"error\": \"Invalid user session token\"}";
        } else {
            return "{\"username\": \"" + currentUser + "\"}";
        }
    }

    @POST
    @Path("logout")
    public void logout(@CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/admin/logout - Logging out user");

        if (sessionCookie != null) {
            String token = sessionCookie.getValue();
            try {
                PreparedStatement statement = Main.db.prepareStatement("Update Admins SET SessionToken = NULL WHERE SessionToken = ?");
                statement.setString(1, token);
                statement.executeUpdate();
            } catch (SQLException resultsException) {
                String error = "Database error - can't update 'Admins' table: " + resultsException.getMessage();
                System.out.println(error);
            }
        }

    }


    @SuppressWarnings("Duplicates")
    @POST
    @Path("new/{username}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public String addAdmin(  @PathParam("username") String username,
                             @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/admin/new/" + username + " - Adding new admin to database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("INSERT INTO Admins (Username, Password) VALUES (?, 'password')");
            statement.setString(1, username.toLowerCase());
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't insert into 'Admins' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    @SuppressWarnings("Duplicates")
    @POST
    @Path("reset/{username}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public String resetPassword(  @PathParam("username") String username,
                                  @FormParam("password") String password,
                                  @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/admin/reset/" + username + " - Resetting password for user in database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("UPDATE Admins SET Password = ? WHERE LOWER(Username) = ?");
            statement.setString(1, password);
            statement.setString(2, username.toLowerCase());
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't update 'Admins' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    @SuppressWarnings("Duplicates")
    @POST
    @Path("rename/{oldUsername}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public String renameAdmin( @PathParam("oldUsername") String oldUsername,
                               @FormParam("newUsername") String newUsername,
                               @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/admin/reset/" + oldUsername + " - Renaming user in database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("UPDATE Admins SET Username = ? WHERE LOWER(Username) = ?");
            statement.setString(1, newUsername.toLowerCase());
            statement.setString(2, oldUsername.toLowerCase());
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't update 'Admins' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    @SuppressWarnings("Duplicates")
    @POST
    @Path("delete/{username}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteAdmin( @PathParam("username") String username,
                                 @CookieParam("sessionToken") Cookie sessionCookie, @Context HttpServletRequest request) {

        System.out.println("/admin/delete/" + username + " - Deleting user in database");

        try {

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            if (currentUsername.toLowerCase().equals(username.toLowerCase())) {
                return "{\"error\": \"You can't delete yourself!\"}";
            }

            PreparedStatement statement;
            statement = Main.db.prepareStatement("DELETE FROM Admins WHERE LOWER(Username) = ?");
            statement.setString(1, username.toLowerCase());
            statement.executeUpdate();

            return "{\"status\": \"OK\"}";

        } catch (SQLException resultsException) {
            String error = "Database error - can't delete from 'Admins' table: " + resultsException.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }


}
