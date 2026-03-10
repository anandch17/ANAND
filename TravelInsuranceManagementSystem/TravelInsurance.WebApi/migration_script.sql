IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [DestinationRisks] (
    [Id] int NOT NULL IDENTITY,
    [Destination] nvarchar(max) NOT NULL,
    [RiskMultiplier] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_DestinationRisks] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [InsurancePlans] (
    [Id] int NOT NULL IDENTITY,
    [PolicyName] nvarchar(max) NOT NULL,
    [PlanType] nvarchar(max) NOT NULL,
    [MaxCoverageAmount] decimal(18,2) NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_InsurancePlans] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [DateOfBirth] datetime2 NULL,
    [AadharCardNumber] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [DateOfJoin] datetime2 NULL,
    [CommissionRate] decimal(18,2) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Coverages] (
    [Id] int NOT NULL IDENTITY,
    [CoverageType] nvarchar(max) NOT NULL,
    [CoverageAmount] decimal(18,2) NOT NULL,
    [InsurancePlanId] int NOT NULL,
    CONSTRAINT [PK_Coverages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Coverages_InsurancePlans_InsurancePlanId] FOREIGN KEY ([InsurancePlanId]) REFERENCES [InsurancePlans] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [PremiumRules] (
    [Id] int NOT NULL IDENTITY,
    [InsurancePlanId] int NOT NULL,
    [BasePrice] decimal(18,2) NOT NULL,
    [AgeBelow30Multiplier] decimal(18,2) NOT NULL,
    [AgeBetween30And50Multiplier] decimal(18,2) NOT NULL,
    [AgeAbove50Multiplier] decimal(18,2) NOT NULL,
    [PerDayRate] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_PremiumRules] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PremiumRules_InsurancePlans_InsurancePlanId] FOREIGN KEY ([InsurancePlanId]) REFERENCES [InsurancePlans] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Policies] (
    [Id] int NOT NULL IDENTITY,
    [CustomerId] int NOT NULL,
    [AgentId] int NULL,
    [InsurancePlanId] int NOT NULL,
    [DestinationCountry] nvarchar(max) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [PremiumAmount] decimal(18,2) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CoverageId] int NULL,
    CONSTRAINT [PK_Policies] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Policies_Coverages_CoverageId] FOREIGN KEY ([CoverageId]) REFERENCES [Coverages] ([Id]),
    CONSTRAINT [FK_Policies_InsurancePlans_InsurancePlanId] FOREIGN KEY ([InsurancePlanId]) REFERENCES [InsurancePlans] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Policies_Users_AgentId] FOREIGN KEY ([AgentId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Policies_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Claims] (
    [Id] int NOT NULL IDENTITY,
    [PolicyId] int NOT NULL,
    [ClaimType] nvarchar(max) NOT NULL,
    [ClaimAmount] decimal(18,2) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [AssignedOfficerId] int NOT NULL,
    [CreatedDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Claims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Claims_Policies_PolicyId] FOREIGN KEY ([PolicyId]) REFERENCES [Policies] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Claims_Users_AssignedOfficerId] FOREIGN KEY ([AssignedOfficerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Payments] (
    [Id] int NOT NULL IDENTITY,
    [PolicyId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaymentDate] datetime2 NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Payments_Policies_PolicyId] FOREIGN KEY ([PolicyId]) REFERENCES [Policies] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ClaimDocuments] (
    [Id] int NOT NULL IDENTITY,
    [ClaimId] int NOT NULL,
    [Url] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_ClaimDocuments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ClaimDocuments_Claims_ClaimId] FOREIGN KEY ([ClaimId]) REFERENCES [Claims] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ClaimDocuments_ClaimId] ON [ClaimDocuments] ([ClaimId]);
GO

CREATE INDEX [IX_Claims_AssignedOfficerId] ON [Claims] ([AssignedOfficerId]);
GO

CREATE INDEX [IX_Claims_PolicyId] ON [Claims] ([PolicyId]);
GO

CREATE INDEX [IX_Coverages_InsurancePlanId] ON [Coverages] ([InsurancePlanId]);
GO

CREATE INDEX [IX_Payments_PolicyId] ON [Payments] ([PolicyId]);
GO

CREATE INDEX [IX_Policies_AgentId] ON [Policies] ([AgentId]);
GO

CREATE INDEX [IX_Policies_CoverageId] ON [Policies] ([CoverageId]);
GO

CREATE INDEX [IX_Policies_CustomerId] ON [Policies] ([CustomerId]);
GO

CREATE INDEX [IX_Policies_InsurancePlanId] ON [Policies] ([InsurancePlanId]);
GO

CREATE UNIQUE INDEX [IX_PremiumRules_InsurancePlanId] ON [PremiumRules] ([InsurancePlanId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260227083037_entityupdate', N'8.0.24');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Claims]') AND [c].[name] = N'AssignedOfficerId');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Claims] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Claims] ALTER COLUMN [AssignedOfficerId] int NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260227180422_third', N'8.0.24');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Claims] ADD [SettledAmount] decimal(18,2) NULL;
GO

ALTER TABLE [Claims] ADD [SettledDate] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260301065017_claimsentitychange', N'8.0.24');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Users] ADD [ResetToken] nvarchar(max) NULL;
GO

ALTER TABLE [Users] ADD [ResetTokenExpiry] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260301104927_AddPasswordResetToken', N'8.0.24');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Policies] ADD [AgeMultiplier] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [PurchaseAge] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260302202243_newvariables', N'8.0.24');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Claims] ADD [Description] nvarchar(max) NULL;
GO

ALTER TABLE [Claims] ADD [ReviewNotes] nvarchar(max) NULL;
GO

CREATE TABLE [Travelers] (
    [Id] int NOT NULL IDENTITY,
    [PolicyId] int NOT NULL,
    [FullName] nvarchar(max) NOT NULL,
    [DateOfBirth] datetime2 NOT NULL,
    [Aadharcard] nvarchar(max) NOT NULL,
    [TravelerType] nvarchar(max) NOT NULL,
    [Relationship] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Travelers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Travelers_Policies_PolicyId] FOREIGN KEY ([PolicyId]) REFERENCES [Policies] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Travelers_PolicyId] ON [Travelers] ([PolicyId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260308104403_AddTravelersAndClaimDescriptions', N'8.0.24');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Policies] ADD [AgeAbove50Multiplier] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [AgeBelow30Multiplier] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [AgeBetween30And50Multiplier] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [BasePrice] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [CoveragesJson] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Policies] ADD [MaxCoverageAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [PerDayRate] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [Policies] ADD [PlanName] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Policies] ADD [PlanType] nvarchar(max) NOT NULL DEFAULT N'';
GO


                UPDATE p
                SET 
                    p.PlanName = ip.PolicyName,
                    p.PlanType = ip.PlanType,
                    p.MaxCoverageAmount = ip.MaxCoverageAmount,
                    p.BasePrice = ISNULL(pr.BasePrice, 0),
                    p.PerDayRate = ISNULL(pr.PerDayRate, 0),
                    p.AgeBelow30Multiplier = ISNULL(pr.AgeBelow30Multiplier, 1),
                    p.AgeBetween30And50Multiplier = ISNULL(pr.AgeBetween30And50Multiplier, 1),
                    p.AgeAbove50Multiplier = ISNULL(pr.AgeAbove50Multiplier, 1),
                    p.CoveragesJson = ISNULL((
                        SELECT c.CoverageType, c.CoverageAmount
                        FROM Coverages c
                        WHERE c.InsurancePlanId = p.InsurancePlanId
                        FOR JSON PATH
                    ), '[]')
                FROM Policies p
                INNER JOIN InsurancePlans ip ON p.InsurancePlanId = ip.Id
                LEFT JOIN PremiumRule pr ON ip.Id = pr.InsurancePlanId
                WHERE p.PlanName = '';
            
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260308195049_AddPolicySnapshotData', N'8.0.24');
GO

COMMIT;
GO

