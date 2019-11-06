package Controllers;

import Server.Main;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import javax.imageio.ImageIO;
import javax.ws.rs.*;
import javax.ws.rs.core.Cookie;
import javax.ws.rs.core.MediaType;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

@Path("image/")
public class Image {

    /*-------------------------------------------------------
    The API request handler for /image/list
        FormDataParams: none
        Cookies: none
    ------------------------------------------------------*/
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    public String listImages() {

        System.out.println("/image/list - Getting all image files from folder");

        ArrayList<String> systemImages = new ArrayList<>();
        ArrayList<String> softwareImages = new ArrayList<>();
        ArrayList<String> accessoryImages = new ArrayList<>();

        try {

            PreparedStatement systemImagesStatement = Main.db.prepareStatement("SELECT ImageURL FROM Systems");
            ResultSet systemResults = systemImagesStatement.executeQuery();
            while (systemResults != null && systemResults.next()) {
                systemImages.add(systemResults.getString("ImageURL"));
            }

            PreparedStatement softwareImagesStatement = Main.db.prepareStatement("SELECT ImageURL FROM Software");
            ResultSet softwareResults = softwareImagesStatement.executeQuery();
            while (softwareResults != null && softwareResults.next()) {
                softwareImages.add(softwareResults.getString("ImageURL"));
            }

            PreparedStatement accessoryImagesStatement = Main.db.prepareStatement("SELECT ImageURL FROM Accessories");
            ResultSet accessoryResults = accessoryImagesStatement.executeQuery();
            while (accessoryResults != null && accessoryResults.next()) {
                accessoryImages.add(accessoryResults.getString("ImageURL"));
            }


        } catch (Exception resultsException) {

            String error = "Database error - can't select all from one of the tables with images: " + resultsException.getMessage();

            System.out.println("Image upload error: " + error);
            return "{\"error\":\"" + error + "\"}";

        }

        ArrayList<String> images = new ArrayList<>();

        File folder = new File("resources/client/img");

        File[] sortedFiles = folder.listFiles();

        if (sortedFiles != null) {

            Arrays.sort(sortedFiles, new Comparator<File>() {
                @Override
                public int compare(File file1, File file2) {
                    return file1.getName().compareTo(file2.getName());
                }
            });

            for (File file : sortedFiles) {
                if (file.isFile()) {
                    images.add(file.getName());
                }
            }
        }

        JSONArray responses = new JSONArray();

        for (String imageFilename : images) {

            int systemCount = 0;
            for (String systemImage : systemImages) {
                if (imageFilename.equals(systemImage)) systemCount++;
            }

            int softwareCount = 0;
            for (String softwareImage : softwareImages) {
                if (imageFilename.equals(softwareImage)) softwareCount++;
            }

            int accessoryCount = 0;
            for (String accessoryImage : accessoryImages) {
                if (imageFilename.equals(accessoryImage)) accessoryCount++;
            }

            JSONObject image = new JSONObject();
            image.put("filename", imageFilename);
            image.put("systems", systemCount);
            image.put("software", softwareCount);
            image.put("accessories", accessoryCount);
            responses.add(image);
        }

        return responses.toString();

    }

    /*-------------------------------------------------------
    The API request handler for /image/upload
        FormDataParams: file (upload)
        Cookies: sessionToken
    ------------------------------------------------------*/
    @POST
    @Path("upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String uploadImage(@FormDataParam("file") InputStream fileInputStream, @FormDataParam("file") FormDataContentDisposition formData,
                              @CookieParam("sessionToken") String sessionCookie) {

        System.out.println("/image/upload - Request to upload image " + formData.getFileName());

        String currentUsername = Admin.validateSessionCookie(sessionCookie);
        if (currentUsername == null) {
            return "{\"error\": \"Not logged in as valid admin\"}";
        }

        try {

            int read;
            byte[] bytes = new byte[1024];
            OutputStream outputStream = new FileOutputStream(new File("resources/client/img/" + formData.getFileName() + "_temp"));
            while ((read = fileInputStream.read(bytes)) != -1) {
                outputStream.write(bytes, 0, read);
            }
            outputStream.flush();
            outputStream.close();

            File tempFile = new File("resources/client/img/" + formData.getFileName() + "_temp");
            BufferedImage originalImage = ImageIO.read(tempFile);

            BufferedImage resizedImage = new BufferedImage(800, 600, originalImage.getType() == 0? BufferedImage.TYPE_INT_ARGB : originalImage.getType());
            Graphics2D g = resizedImage.createGraphics();
            g.drawImage(originalImage, 0, 0, 800, 600, null);
            g.dispose();

            ImageIO.write(resizedImage, "jpg", new File("resources/client/img/" + formData.getFileName()));
            if (!tempFile.delete()) {
                throw new IOException("Failed to delete temp file.");
            }

            return "{\"status\":\"OK\"}";

        } catch (IOException ioe) {

            System.out.println("Image upload error: " + ioe.getMessage());
            return "{\"error\":\"" + ioe.getMessage() + "\"}";

        }

    }

    /*-------------------------------------------------------
    The API request handler for /image/rename
        FormDataParams: oldFilename, newFilename
        Cookies: sessionToken
    ------------------------------------------------------*/
    @POST
    @Path("rename")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String renameImageFile(@FormDataParam("oldFilename") String oldFilename,
                                  @FormDataParam("newFilename") String newFilename,
                                  @CookieParam("sessionToken") String sessionCookie) {

        try {

            if (oldFilename == null ||
                    newFilename == null) {
                throw new Exception("One or more form data parameters are missing in the HTTP request.");
            }

            System.out.println("/image/rename oldFilename=" + oldFilename + " newFilename=" + newFilename + " - Renaming image");

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            File file1 = new File("resources/client/img/" + oldFilename);
            File file2 = new File("resources/client/img/" + newFilename);
            if (file2.exists()) {
                throw new IOException("New file name already exists.");
            }
            boolean success = file1.renameTo(file2);
            if (!success) {
                throw new IOException("Failed to rename file.");
            }

            return "{\"status\": \"OK\"}";

        } catch (Exception exception) {
            String error = "File rename error: " + exception.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

    /*-------------------------------------------------------
    The API request handler for /image/delete
        FormDataParams: filename
        Cookies: sessionToken
    ------------------------------------------------------*/
    @SuppressWarnings("Duplicates")
    @POST
    @Path("delete")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public String deleteImageFile(  @FormDataParam("filename") String filename,
                                    @CookieParam("sessionToken") String sessionCookie) {

        try {

            if (filename == null) {
                throw new Exception("One or more form data parameters are missing in the HTTP request.");
            }

            System.out.println("/image/delete filename=" + filename + " - Deleting image");

            String currentUsername = Admin.validateSessionCookie(sessionCookie);
            if (currentUsername == null) {
                return "{\"error\": \"Not logged in as valid admin\"}";
            }

            File file = new File("resources/client/img/" + filename);

            if (!file.delete()) {
                throw new IOException("Failed to delete file.");
            }

            return "{\"status\": \"OK\"}";

        } catch (Exception exception) {
            String error = "File delete error: " + exception.getMessage();
            System.out.println(error);
            return "{\"error\": \"" + error + "\"}";
        }

    }

}
