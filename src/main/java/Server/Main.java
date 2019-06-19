package Server;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;
import org.sqlite.SQLiteConfig;

import java.sql.Connection;
import java.sql.DriverManager;

public class Main {

    public static Connection db = null;

    private static void openDatabase(String dbFile)
    {

        try  {

            Class.forName("org.sqlite.JDBC");
            SQLiteConfig config = new SQLiteConfig();
            config.enforceForeignKeys(true);
            db = DriverManager.getConnection("jdbc:sqlite:resources/" + dbFile, config.toProperties());
            System.out.println("Database connection successfully established.");

        } catch (Exception exception) {

            System.out.println("Database connection error: " + exception.getMessage());
        }

    }

    public static void main(String[] args) {

        openDatabase("Systems.db");

        ResourceConfig config = new ResourceConfig();       // Prepare the server configuration (uses the Jetty library).
        config.packages("Controllers");                     // The package containing the HTTP request handlers for the API.
        config.register(MultiPartFeature.class);            // Enables support for multi-part forms (important!)
        Server server = new Server(8081);             // The port number to connect to (part of the URL).

        ServletHolder servlet = new ServletHolder(new ServletContainer(config));            // Creates the Jersey 'servlet' to run on the server.
        ServletContextHandler context = new ServletContextHandler(server, "/");
        context.addServlet(servlet, "/*");                                         // Connect the servlet to the server.

        try {
            server.start();                                 // Actually start the server!
            System.out.println("Server successfully started.");
            server.join();                                  // This line of code leaves the program running indefinitely, waiting for HTTP requests.
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}

