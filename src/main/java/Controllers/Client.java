package Controllers;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/* ------------------------------------------------------------------------------
 This class serves up the static HTML, CSS, JavaScript and images to the client.
 You shouldn't need to change anything unless you are adding other file types.
 ------------------------------------------------------------------------------ */
@Path("client/")
public class Client {

    @GET
    @Path("img/{path}")
    @Produces({"image/jpeg,image/png"})
    public byte[] getImageFile(@PathParam("path") String path) {
        return getFile("client/img/" + path);
    }

    @GET
    @Path("js/{path}")
    @Produces({"text/javascript"})
    public byte[] getJavaScriptFile(@PathParam("path") String path) {
        return getFile("client/js/" + path);
    }

    @GET
    @Path("css/{path}")
    @Produces({"text/css"})
    public byte[] getCSSFile(@PathParam("path") String path) {
        return getFile("client/css/" + path);
    }

    @GET
    @Path("{path}")
    @Produces({"text/html"})
    public byte[] getIHTMLFile(@PathParam("path") String path) {
        return getFile("client/" + path);
    }

    @GET
    @Path("favicon.ico")
    @Produces({"image/x-icon"})
    public byte[] getFavicon() {
        return getFile("client/favicon.ico");
    }

    private static byte[] getFile(String filename) {
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