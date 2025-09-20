<?php
// =============================================
// File: setup_database.php
// Modified to handle missing columns/tables robustly
// =============================================

// Check if config files exist
$database_config_exists = file_exists('backend/api/config/database.php');
$helper_config_exists = file_exists('backend/api/config/config.php');

if ($database_config_exists) {
    require_once 'backend/api/config/database.php';
}

if ($helper_config_exists) {
    require_once 'backend/api/config/config.php';
}

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Pot Orchid - Database Setup</title>
    <style>
        /* --- (CSS asli kamu dipertahankan, dipersingkat di sini untuk readability) --- */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius:20px; padding:40px; box-shadow:0 20px 40px rgba(0,0,0,0.1); backdrop-filter: blur(10px); }
        .header { text-align:center; margin-bottom: 40px; }
        .header h1 { font-size:2.5em; margin-bottom:10px; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header p { color: #666; font-size:1.1em; }
        .section { background:white; margin-bottom:30px; padding:30px; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.08); }
        .data-table { width:100%; border-collapse:collapse; margin:20px 0; background:white; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.08); }
        .data-table th { background: linear-gradient(45deg, #667eea, #764ba2); color:white; padding:15px 12px; text-align:left; font-weight:600; }
        .data-table td { padding:12px; border-bottom:1px solid #eee; }
        .alert { padding:15px 20px; border-radius:10px; margin:15px 0; font-weight:500; }
        .alert.success { background:#d4edda; color:#155724; border:1px solid #c3e6cb; }
        .alert.error { background:#f8d7da; color:#721c24; border:1px solid #f5c6cb; }
        .alert.info { background:#d1ecf1; color:#0c5460; border:1px solid #bee5eb; }
        .alert.warning { background:#fff3cd; color:#856404; border:1px solid #ffeaa7; }
        .buttons { display:flex; gap:15px; margin:20px 0; }
        .btn { padding:12px 24px; border:none; border-radius:8px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; }
        .btn.primary { background: linear-gradient(45deg, #667eea, #764ba2); color:white; }
        pre { background:#f6f8fa; padding:12px; border-radius:8px; overflow:auto; }
        @media (max-width:768px) { .container { padding:20px; margin:10px; } .header h1 { font-size:2em; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌺 Smart Pot Orchid</h1>
            <p>Database Setup & Configuration Center</p>
        </div>

        <!-- Setup Progress -->
        <div class="section">
            <h2><span class="emoji">📋</span>Setup Progress</h2>

            <?php
            // --- Basic progress vars (sama seperti aslinya) ---
            $steps_completed = 0;
            $total_steps = 5;

            // Check file existence
            $config_exists = $database_config_exists;
            $database_created = false;
            $connection_works = false;
            $tables_exist = false;
            $sample_data_exists = false;

            if ($config_exists) $steps_completed++;

            // Test database connection if config exists
            if ($config_exists) {
                try {
                    $database = new Database();
                    $test_result = $database->testConnection();
                    if ($test_result['status'] === 'success') {
                        $connection_works = true;
                        $database_created = true;
                        $steps_completed += 2;

                        // Check tables
                        $stats = $database->getDatabaseStats();
                        if ($stats['status'] === 'success' && !empty($stats['statistics'])) {
                            $tables_exist = true;
                            $steps_completed++;

                            // Check sample data
                            if (isset($stats['statistics']['users']) && $stats['statistics']['users'] > 0) {
                                $sample_data_exists = true;
                                $steps_completed++;
                            }
                        }
                    }
                } catch (Exception $e) {
                    // Connection failed - we will show details later
                }
            }

            $progress_percentage = ($steps_completed / $total_steps) * 100;
            ?>

            <div class="progress-bar" style="width:100%; height:8px; background:#e9ecef; border-radius:4px; overflow:hidden; margin-bottom:10px;">
                <div style="width: <?= $progress_percentage ?>%; height:100%; background: linear-gradient(45deg, #28a745, #20c997);"></div>
            </div>
            <p style="text-align:center; margin:10px 0; color:#666;">
                Progress: <?= $steps_completed ?>/<?= $total_steps ?> steps completed (<?= round($progress_percentage) ?>%)
            </p>

            <div style="margin:20px 0;">
                <div style="display:flex; align-items:center; margin:8px 0;">
                    <div style="width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:12px; <?= $config_exists ? 'background:#28a745;color:#fff' : 'background:#e9ecef;color:#6c757d' ?>">1</div>
                    <div style="color:#555">Configuration files created</div>
                </div>
                <div style="display:flex; align-items:center; margin:8px 0;">
                    <div style="width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:12px; <?= $database_created ? 'background:#28a745;color:#fff' : 'background:#e9ecef;color:#6c757d' ?>">2</div>
                    <div style="color:#555">Database created</div>
                </div>
                <div style="display:flex; align-items:center; margin:8px 0;">
                    <div style="width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:12px; <?= $connection_works ? 'background:#28a745;color:#fff' : 'background:#e9ecef;color:#6c757d' ?>">3</div>
                    <div style="color:#555">Database connection works</div>
                </div>
                <div style="display:flex; align-items:center; margin:8px 0;">
                    <div style="width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:12px; <?= $tables_exist ? 'background:#28a745;color:#fff' : 'background:#e9ecef;color:#6c757d' ?>">4</div>
                    <div style="color:#555">Database tables created</div>
                </div>
                <div style="display:flex; align-items:center; margin:8px 0;">
                    <div style="width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-right:12px; <?= $sample_data_exists ? 'background:#28a745;color:#fff' : 'background:#e9ecef;color:#6c757d' ?>">5</div>
                    <div style="color:#555">Sample data inserted</div>
                </div>
            </div>
        </div>

        <!-- File Status Check -->
        <div class="section">
            <h2><span class="emoji">📁</span>File Status Check</h2>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap:20px;">
                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.08); border-left:5px solid <?= $database_config_exists ? '#28a745' : '#dc3545' ?>">
                    <div style="display:flex; align-items:center; margin-bottom:15px;">
                        <div style="font-size:2em; margin-right:15px;"><?= $database_config_exists ? '✅' : '❌' ?></div>
                        <div style="font-weight:600; color:#333">Database Config</div>
                    </div>
                    <div style="color:#555">
                        <strong>Path:</strong> backend/api/config/database.php<br>
                        <strong>Status:</strong> <?= $database_config_exists ? 'Found' : 'Missing' ?><br>
                        <?php if (!$database_config_exists): ?>
                            <small style="color:#dc3545;">Please create this file first!</small>
                        <?php endif; ?>
                    </div>
                </div>

                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.08); border-left:5px solid <?= $helper_config_exists ? '#28a745' : '#ffc107' ?>">
                    <div style="display:flex; align-items:center; margin-bottom:15px;">
                        <div style="font-size:2em; margin-right:15px;"><?= $helper_config_exists ? '✅' : '⚠️' ?></div>
                        <div style="font-weight:600; color:#333">Helper Config</div>
                    </div>
                    <div style="color:#555">
                        <strong>Path:</strong> backend/api/config/config.php<br>
                        <strong>Status:</strong> <?= $helper_config_exists ? 'Found' : 'Optional' ?><br>
                        <small>Contains helper functions for API</small>
                    </div>
                </div>

                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.08); border-left:5px solid #17a2b8">
                    <div style="display:flex; align-items:center; margin-bottom:15px;">
                        <div style="font-size:2em; margin-right:15px;">📂</div>
                        <div style="font-weight:600; color:#333">Directory Structure</div>
                    </div>
                    <div style="color:#555">
                        <strong>Project Root:</strong> <?= htmlspecialchars(realpath(__DIR__)) . '/'; ?><br>
                        <strong>Backend Path:</strong> backend/api/<br>
                        <small>Make sure folder structure is correct</small>
                    </div>
                </div>
            </div>
        </div>

        <?php if (!$database_config_exists): ?>
        <!-- Setup Instructions -->
        <div class="section">
            <h2><span class="emoji">🛠️</span>Setup Instructions</h2>

            <div class="alert warning">
                <strong>⚠️ Configuration Missing!</strong><br>
                You need to create the database configuration file before proceeding.
            </div>

            <h3><span class="emoji">📝</span>Step 1: Create database.php</h3>
            <p>Create the file <code>backend/api/config/database.php</code> with the following content:</p>

            <div class="code-block" style="background:#2d3748; color:#e2e8f0; padding:20px; border-radius:10px; overflow:auto;">
&lt;?php
class Database {
    private $host = 'localhost';
    private $db_name = 'smart_pot_orchid';
    private $username = 'postgres';
    private $password = 'YOUR_POSTGRESQL_PASSWORD';
    private $port = '5432';

    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
            die();
        }
        return $this->conn;
    }

    // ... (add other methods from the full database.php file)
}
?&gt;
            </div>

            <div class="alert info">
                <strong>💡 Don't forget to:</strong><br>
                1. Replace 'YOUR_POSTGRESQL_PASSWORD' with your actual PostgreSQL password<br>
                2. Make sure PostgreSQL is running<br>
                3. Create the database 'smart_pot_orchid' in pgAdmin
            </div>
        </div>

        <?php else: ?>

        <!-- Database Connection Test -->
        <div class="section">
            <h2><span class="emoji">🔌</span>Database Connection Test</h2>

            <?php
            try {
                $database = new Database();
                $test_result = $database->testConnection();

                if ($test_result['status'] === 'success'):
            ?>

            <div class="alert success">
                <strong>✅ Database Connection Successful!</strong><br>
                Connected to: <strong><?= htmlspecialchars($test_result['database_name'] ?? 'unknown') ?></strong> at <?= htmlspecialchars($test_result['host'] ?? 'localhost') ?>:<?= htmlspecialchars($test_result['port'] ?? '') ?><br>
                PostgreSQL Version: <strong><?= htmlspecialchars($test_result['postgresql_version'] ?? '-') ?></strong>
            </div>

            <?php else: ?>

            <div class="alert error">
                <strong>❌ Database Connection Failed!</strong><br>
                <?= htmlspecialchars($test_result['message'] ?? 'Unknown error') ?>
            </div>

            <div class="alert info">
                <strong>🔧 Troubleshooting Steps:</strong><br>
                1. Make sure PostgreSQL service is running<br>
                2. Check username/password in database.php<br>
                3. Verify database 'smart_pot_orchid' exists<br>
                4. Test manual connection: <code>psql -U postgres -h localhost smart_pot_orchid</code>
            </div>

            <?php endif; ?>

            <?php
            } catch (Exception $e) {
            ?>

            <div class="alert error">
                <strong>❌ Configuration Error!</strong><br>
                <?= htmlspecialchars($e->getMessage()) ?>
            </div>

            <?php } ?>
        </div>

        <?php if ($connection_works): ?>

        <!-- Database Statistics -->
        <div class="section">
            <h2><span class="emoji">📊</span>Database Statistics</h2>

            <?php
            $stats = $database->getDatabaseStats();

            if ($stats['status'] === 'success'):
            ?>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Table Name</th>
                        <th>Description</th>
                        <th>Record Count</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $expected_tables = [
                        'users' => 'User accounts and authentication',
                        'orchid' => 'Orchid pot configurations and thresholds',
                        'wateringhistory' => 'Automatic and manual watering records',
                        'sensordata' => 'Sensor readings (moisture, temperature, etc.)'
                    ];

                    foreach ($expected_tables as $table => $description):
                        $count = isset($stats['statistics'][$table]) ? $stats['statistics'][$table] : 0;
                        $status = $count > 0 ? '✅ Has Data' : ($count === 0 ? '⚠️ Empty' : '❌ Missing');
                    ?>
                    <tr>
                        <td><strong><?= ucfirst($table) ?></strong></td>
                        <td><?= htmlspecialchars($description) ?></td>
                        <td><?= htmlspecialchars((string)$count) ?> records</td>
                        <td><?= $status ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php else: ?>

            <div class="alert error">
                <strong>❌ Unable to retrieve database statistics</strong><br>
                <?= htmlspecialchars($stats['message'] ?? 'Unknown') ?>
            </div>

            <?php endif; ?>
        </div>

        <!-- Sample Data Preview -->
        <div class="section">
            <h2><span class="emoji">🔍</span>Sample Data Preview</h2>

            <?php
            try {
                $conn = $database->getConnection();
                // ensure associative fetch
                $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                // helper functions to check table/column existence (Postgres)
                function hasTable(PDO $pdo, string $table): bool {
                    $sql = "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND lower(table_name) = lower(:table) LIMIT 1";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute(['table' => $table]);
                    return (bool)$stmt->fetchColumn();
                }

                function hasColumn(PDO $pdo, string $table, string $column): bool {
                    $sql = "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND lower(table_name) = lower(:table) AND lower(column_name) = lower(:column) LIMIT 1";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute(['table' => $table, 'column' => $column]);
                    return (bool)$stmt->fetchColumn();
                }

                // --- Preview Users (defensive: only select columns that exist) ---
                echo "<h3><span class='emoji'>👥</span>Users</h3>";

                if (hasTable($conn, 'users')) {
                    $userSelect = ['user_id', 'username', 'email'];
                    $userOrder = null;
                    if (hasColumn($conn, 'users', 'created_at')) {
                        $userSelect[] = 'created_at';
                        $userOrder = 'created_at';
                    } elseif (hasColumn($conn, 'users', 'user_id')) {
                        $userOrder = 'user_id';
                    }

                    $sql = "SELECT " . implode(', ', array_map(function($c){ return $c; }, $userSelect)) . " FROM users";
                    if ($userOrder) $sql .= " ORDER BY " . $userOrder . " DESC";
                    $sql .= " LIMIT 5";

                    $stmt = $conn->query($sql);
                    $users = $stmt->fetchAll();

                    if (count($users) > 0):
            ?>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <?php if (in_array('created_at', $userSelect)): ?><th>Created At</th><?php endif; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?= htmlspecialchars($user['user_id'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($user['username'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($user['email'] ?? '-') ?></td>
                        <?php if (in_array('created_at', $userSelect)): ?><td><?= htmlspecialchars($user['created_at'] ?? '-') ?></td><?php endif; ?>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php
                    else:
                        echo "<div class='alert warning'>No users found. Please run the sample data insert script.</div>";
                    endif;
                } else {
                    echo "<div class='alert info'>Tabel <strong>users</strong> tidak ditemukan.</div>";
                }

                // --- Preview Orchids (defensive: don't assume created_at or owner columns) ---
                echo "<h3><span class='emoji'>🌺</span>Orchids</h3>";

                if (hasTable($conn, 'orchid')) {
                    // Build select list based on existing columns
                    $orchidCols = ['orchid_id','orchid_name','orchid_type','min_moisture','max_moisture','location','user_id'];
                    $selectParts = [];
                    foreach ($orchidCols as $c) {
                        if (hasColumn($conn, 'orchid', $c)) {
                            $selectParts[] = "o." . $c;
                        }
                    }

                    // join user info as owner_username if possible
                    $joinUsers = false;
                    if (hasTable($conn, 'users') && hasColumn($conn, 'orchid', 'user_id') && hasColumn($conn, 'users', 'user_id') && hasColumn($conn, 'users', 'username')) {
                        $selectParts[] = "u.username AS owner_username";
                        $joinUsers = true;
                    }

                    if (empty($selectParts)) {
                        // fallback: select all (safer than nothing)
                        $selectParts[] = "o.*";
                    }

                    $orderBy = hasColumn($conn, 'orchid', 'created_at') ? 'o.created_at' : (hasColumn($conn, 'orchid', 'orchid_id') ? 'o.orchid_id' : null);
                    $sql = "SELECT " . implode(', ', $selectParts) . " FROM orchid o";
                    if ($joinUsers) $sql .= " JOIN users u ON o.user_id = u.user_id";
                    if ($orderBy) $sql .= " ORDER BY " . $orderBy . " DESC";
                    $sql .= " LIMIT 5";

                    $stmt = $conn->query($sql);
                    $orchids = $stmt->fetchAll();

                    if (count($orchids) > 0):
            ?>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Moisture Range</th>
                        <th>Owner</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orchids as $orchid): ?>
                    <tr>
                        <td><?= htmlspecialchars($orchid['orchid_id'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($orchid['orchid_name'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($orchid['orchid_type'] ?? '-') ?></td>
                        <td>
                            <?php
                            $min = $orchid['min_moisture'] ?? null;
                            $max = $orchid['max_moisture'] ?? null;
                            if ($min !== null || $max !== null) {
                                echo htmlspecialchars(($min !== null ? $min : '-') . '% - ' . ($max !== null ? $max : '-').'%');
                            } else {
                                echo '-';
                            }
                            ?>
                        </td>
                        <td><?= htmlspecialchars($orchid['owner_username'] ?? ($orchid['user_id'] ?? '-')) ?></td>
                        <td><?= htmlspecialchars($orchid['location'] ?? '-') ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php
                    else:
                        echo "<div class='alert warning'>No orchids found. Please run the sample data insert script.</div>";
                    endif;
                } else {
                    echo "<div class='alert info'>Tabel <strong>orchid</strong> tidak ditemukan.</div>";
                }

                // --- Preview Latest Sensor Data (if exists) ---
                echo "<h3><span class='emoji'>📡</span>Latest Sensor Data</h3>";
                if (hasTable($conn, 'sensordata')) {
                    $stmt = $conn->query("SELECT * FROM sensordata LIMIT 5");
                    $sensors = $stmt->fetchAll();
                    if (count($sensors) > 0):
            ?>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Orchid</th>
                        <th>Soil Moisture</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Water Level</th>
                        <th>Light</th>
                        <th>Status</th>
                        <th>Last Reading</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($sensors as $sensor): ?>
                    <tr>
                        <td>
                            <strong><?= htmlspecialchars($sensor['orchid_name'] ?? '-') ?></strong><br>
                            <small><?= htmlspecialchars($sensor['orchid_type'] ?? '-') ?></small>
                        </td>
                        <td><?= htmlspecialchars(isset($sensor['soil_moisture']) ? $sensor['soil_moisture'] . '%' : '-') ?></td>
                        <td><?= htmlspecialchars(isset($sensor['temperature']) ? $sensor['temperature'] . '°C' : '-') ?></td>
                        <td><?= htmlspecialchars(isset($sensor['humidity']) ? $sensor['humidity'] . '%' : '-') ?></td>
                        <td><?= htmlspecialchars(isset($sensor['water_level']) ? $sensor['water_level'] . '%' : '-') ?></td>
                        <td><?= htmlspecialchars(isset($sensor['light_intensity']) ? $sensor['light_intensity'] . ' lux' : '-') ?></td>
                        <td>
                            <?php
                            $status = $sensor['moisture_status'] ?? null;
                            if ($status === 'NORMAL') {
                                $status_color = '#28a745';
                            } elseif ($status === 'LOW_MOISTURE') {
                                $status_color = '#dc3545';
                            } else {
                                $status_color = '#ffc107';
                            }
                            ?>
                            <span style="color: <?= htmlspecialchars($status_color) ?>; font-weight:bold;"><?= htmlspecialchars(str_replace('_',' ',$status ?? '-')) ?></span>
                        </td>
                        <td><?= htmlspecialchars($sensor['last_reading'] ?? '-') ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php
                    else:
                        echo "<div class='alert info'>No sensor data found. This is normal if hardware is not connected yet.</div>";
                    endif;
                } else {
                    echo "<div class='alert info'>Tabel <strong>latest_sensor_data</strong> tidak ditemukan.</div>";
                }

            } catch (Exception $e) {
                echo "<div class='alert error'><strong>❌ Query Error:</strong><br>" . htmlspecialchars($e->getMessage()) . "</div>";
            }
            ?>
        </div>

        <?php endif; // end connection_works check ?>
        <?php endif; // end config exists check ?>

        <!-- Action Buttons -->
        <div class="section">
            <h2><span class="emoji">🎯</span>Quick Actions</h2>

            <div class="buttons">
                <a href="?" class="btn primary">🔄 Refresh Status</a>
                <a href="backend/api/migrations/create_sample_data.php" class="btn" style="background:#6c757d;color:#fff;">📂 Run Sample Data (if available)</a>
                <a href="backend/api/config/database.php" class="btn" style="background:#28a745;color:#fff;">⚙️ Open DB Config</a>
            </div>

        </div>

    </div>
</body>
</html>
