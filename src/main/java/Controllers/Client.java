package Controllers;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Path("/client")
public class Client {

    @GET
    @Path("img/{path}")
    @Produces({"image/jpeg,image/png"})
    public byte[] getImageFile(@PathParam("path") String path, @Context HttpServletRequest request) {
        return getFile("client/img/" + path, request);
    }

    @GET
    @Path("js/{path}")
    @Produces({"text/javascript"})
    public byte[] getJavaScriptFile(@PathParam("path") String path, @Context HttpServletRequest request) {
        return getFile("client/js/" + path, request);
    }

    @GET
    @Path("css/{path}")
    @Produces({"text/css"})
    public byte[] getCSSFile(@PathParam("path") String path, @Context HttpServletRequest request) {
        return getFile("client/css/" + path, request);
    }

    @GET
    @Path("{path}")
    @Produces({"text/html"})
    public byte[] getIHTMLFile(@PathParam("path") String path, @Context HttpServletRequest request) {
        return getFile("client/" + path, request);
    }

    @GET
    @Path("favicon.ico")
    @Produces({"image/x-icon"})
    public byte[] getFavicon(@Context HttpServletRequest request) {
        return getFile("client/favicon.ico", request);
    }

    public static byte[] getFile(String filename, HttpServletRequest request) {
        try {

            File file = new File("resources/" + filename);
            byte[] fileData = new byte[(int) file.length()];
            DataInputStream dis = new DataInputStream(new FileInputStream(file));
            dis.readFully(fileData);
            dis.close();
            System.out.println("Sending: " + filename);
            return fileData;
        } catch (IOException ioe) {
            System.out.println("File IO error: " + ioe.getMessage());
        }
        return null;
    }

}