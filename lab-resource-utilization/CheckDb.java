import java.sql.*;

public class CheckDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "Santhu@23";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT email, role FROM users")) {
            
            System.out.println("Email\t\t\tRole");
            System.out.println("----------------------------------");
            while (rs.next()) {
                System.out.println(rs.getString("email") + "\t" + rs.getString("role"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
