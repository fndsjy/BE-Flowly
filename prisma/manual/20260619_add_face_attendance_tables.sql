IF OBJECT_ID(N'dbo.em_face_scan_logs', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.em_face_scan_logs;
END;

IF OBJECT_ID(N'dbo.em_employee_face_profiles', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.em_employee_face_profiles;
END;

IF OBJECT_ID(N'dbo.att_employee_face_profiles', N'U') IS NULL
BEGIN
CREATE TABLE dbo.att_employee_face_profiles (
    employee_face_profile_id BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_att_employee_face_profiles PRIMARY KEY,
    employee_user_id INT NOT NULL,
    face_descriptor NVARCHAR(MAX) NOT NULL,
    face_image NVARCHAR(MAX) NULL,
    model_name NVARCHAR(80) NOT NULL
        CONSTRAINT DF_att_employee_face_profiles_model_name DEFAULT ('vladmandic-face-api'),
    model_version NVARCHAR(40) NULL,
    profile_status VARCHAR(20) NOT NULL
        CONSTRAINT DF_att_employee_face_profiles_profile_status DEFAULT ('ACTIVE'),
    enrolled_at DATETIME NOT NULL
        CONSTRAINT DF_att_employee_face_profiles_enrolled_at DEFAULT (GETDATE()),
    enrolled_by NVARCHAR(64) NULL,
    updated_at DATETIME NOT NULL
        CONSTRAINT DF_att_employee_face_profiles_updated_at DEFAULT (GETDATE()),
    is_deleted BIT NOT NULL
        CONSTRAINT DF_att_employee_face_profiles_is_deleted DEFAULT (0),
    deleted_at DATETIME NULL,
    deleted_by NVARCHAR(64) NULL,
    CONSTRAINT FK_att_employee_face_profiles_employee
        FOREIGN KEY (employee_user_id) REFERENCES dbo.em_employee(UserId)
);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_att_employee_face_profiles_active_employee'
      AND object_id = OBJECT_ID(N'dbo.att_employee_face_profiles')
)
BEGIN
EXEC(N'
    CREATE UNIQUE INDEX UX_att_employee_face_profiles_active_employee
        ON dbo.att_employee_face_profiles(employee_user_id)
        WHERE is_deleted = 0
          AND deleted_at IS NULL
          AND profile_status = ''ACTIVE'';
');
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_att_employee_face_profiles_employee_status'
      AND object_id = OBJECT_ID(N'dbo.att_employee_face_profiles')
)
BEGIN
EXEC(N'
    CREATE INDEX IX_att_employee_face_profiles_employee_status
        ON dbo.att_employee_face_profiles(employee_user_id, profile_status, is_deleted, deleted_at);
');
END;

IF OBJECT_ID(N'dbo.att_face_scan_logs', N'U') IS NULL
BEGIN
CREATE TABLE dbo.att_face_scan_logs (
    face_scan_log_id BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_att_face_scan_logs PRIMARY KEY,
    employee_user_id INT NULL,
    employee_face_profile_id BIGINT NULL,
    employee_attendance_id INT NULL,
    scan_event_type VARCHAR(30) NOT NULL,
    scan_status VARCHAR(30) NOT NULL,
    scan_time DATETIME NOT NULL
        CONSTRAINT DF_att_face_scan_logs_scan_time DEFAULT (GETDATE()),
    match_confidence FLOAT NULL,
    liveness_passed BIT NOT NULL
        CONSTRAINT DF_att_face_scan_logs_liveness_passed DEFAULT (0),
    spoof_type VARCHAR(50) NULL,
    failure_reason NVARCHAR(500) NULL,
    captured_image NVARCHAR(MAX) NULL,
    scan_source VARCHAR(50) NOT NULL
        CONSTRAINT DF_att_face_scan_logs_scan_source DEFAULT ('FACE_WEB'),
    created_at DATETIME NOT NULL
        CONSTRAINT DF_att_face_scan_logs_created_at DEFAULT (GETDATE()),
    is_deleted BIT NOT NULL
        CONSTRAINT DF_att_face_scan_logs_is_deleted DEFAULT (0),
    deleted_at DATETIME NULL,
    deleted_by NVARCHAR(64) NULL,
    CONSTRAINT FK_att_face_scan_logs_employee
        FOREIGN KEY (employee_user_id) REFERENCES dbo.em_employee(UserId),
    CONSTRAINT FK_att_face_scan_logs_face_profile
        FOREIGN KEY (employee_face_profile_id)
        REFERENCES dbo.att_employee_face_profiles(employee_face_profile_id),
    CONSTRAINT FK_att_face_scan_logs_absensi
        FOREIGN KEY (employee_attendance_id) REFERENCES dbo.em_absensi(Id)
);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_att_face_scan_logs_scan_time'
      AND object_id = OBJECT_ID(N'dbo.att_face_scan_logs')
)
BEGIN
CREATE INDEX IX_att_face_scan_logs_scan_time
    ON dbo.att_face_scan_logs(scan_time DESC);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_att_face_scan_logs_employee_scan_time'
      AND object_id = OBJECT_ID(N'dbo.att_face_scan_logs')
)
BEGIN
CREATE INDEX IX_att_face_scan_logs_employee_scan_time
    ON dbo.att_face_scan_logs(employee_user_id, scan_time DESC);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_att_face_scan_logs_status'
      AND object_id = OBJECT_ID(N'dbo.att_face_scan_logs')
)
BEGIN
CREATE INDEX IX_att_face_scan_logs_status
    ON dbo.att_face_scan_logs(scan_status, scan_event_type);
END;
