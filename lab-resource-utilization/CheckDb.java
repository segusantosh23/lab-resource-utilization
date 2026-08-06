import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckDb {
    public static void main(String[] args) {
        String url = System.getenv("DB_URL") != null ? System.getenv("DB_URL") : "jdbc:postgresql://localhost:5432/postgres";
        String user = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "postgres";
        String password = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "postgres"; 

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to the PostgreSQL server successfully.");
            
            stmt.executeUpdate("UPDATE equipment SET quantity = 100 WHERE name = 'Test Tube';");
            System.out.println("Updated test tube quantity successfully.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
