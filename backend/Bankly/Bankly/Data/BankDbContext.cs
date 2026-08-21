using Bankly.Models;
using Microsoft.EntityFrameworkCore;

namespace Bankly.Data
{
    public class BankDbContext : DbContext
    {
        public BankDbContext(
            DbContextOptions<BankDbContext> options)
            : base(options)
        {
        }

        public DbSet<Customer> Customers =>
            Set<Customer>();

        public DbSet<Account> Accounts =>
            Set<Account>();

        public DbSet<Transaction> Transactions =>
            Set<Transaction>();

        public DbSet<User> Users =>
            Set<User>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
            // Customer
            modelBuilder.Entity<Customer>(
                entity =>
                {
                    entity.HasKey(
                        customer =>
                            customer.Id
                    );

                    entity.Property(
                            customer =>
                                customer.FirstName
                        )
                        .IsRequired()
                        .HasMaxLength(100);

                    entity.Property(
                            customer =>
                                customer.LastName
                        )
                        .IsRequired()
                        .HasMaxLength(100);

                    entity.Property(
                            customer =>
                                customer.Email
                        )
                        .IsRequired()
                        .HasMaxLength(150);

                    entity.Property(
                            customer =>
                                customer.PhoneNumber
                        )
                        .IsRequired()
                        .HasMaxLength(30);

                    entity.HasIndex(
                            customer =>
                                customer.Email
                        )
                        .IsUnique();
                }
            );

           
            // User
            modelBuilder.Entity<User>(
                entity =>
                {
                    entity.HasKey(
                        user =>
                            user.Id
                    );

                    entity.Property(
                            user =>
                                user.Username
                        )
                        .IsRequired()
                        .HasMaxLength(50);

                    entity.Property(
                            user =>
                                user.Email
                        )
                        .IsRequired()
                        .HasMaxLength(150);

                    entity.Property(
                            user =>
                                user.PasswordHash
                        )
                        .IsRequired();

                    entity.HasIndex(
                            user =>
                                user.Username
                        )
                        .IsUnique();

                    entity.HasIndex(
                            user =>
                                user.Email
                        )
                        .IsUnique();

                    entity.HasOne(
                            user =>
                                user.Customer
                        )
                        .WithMany()
                        .HasForeignKey(
                            user =>
                                user.CustomerId
                        )
                        .OnDelete(
                            DeleteBehavior.Restrict
                        );
                }
            );

            // Account
            modelBuilder.Entity<Account>(
                entity =>
                {
                    entity.HasKey(
                        account =>
                            account.Id
                    );

                    entity.Property(
                            account =>
                                account.AccountNumber
                        )
                        .IsRequired()
                        .HasMaxLength(20);

                    entity.Property(
                            account =>
                                account.Balance
                        )
                        .HasPrecision(
                            18,
                            2
                        );

                    entity.HasIndex(
                            account =>
                                account.AccountNumber
                        )
                        .IsUnique();

                    entity.HasOne(
                            account =>
                                account.Customer
                        )
                        .WithMany(
                            customer =>
                                customer.Accounts
                        )
                        .HasForeignKey(
                            account =>
                                account.CustomerId
                        )
                        .OnDelete(
                            DeleteBehavior.Restrict
                        );
                }
            );

           
            // Transaction
            modelBuilder.Entity<Transaction>(
                entity =>
                {
                    entity.HasKey(
                        transaction =>
                            transaction.Id
                    );

                    entity.Property(
                            transaction =>
                                transaction.Amount
                        )
                        .HasPrecision(
                            18,
                            2
                        );

                    entity.Property(
                            transaction =>
                                transaction.Type
                        )
                        .IsRequired()
                        .HasMaxLength(30);

                    entity.HasOne(
                            transaction =>
                                transaction.Account
                        )
                        .WithMany(
                            account =>
                                account.Transactions
                        )
                        .HasForeignKey(
                            transaction =>
                                transaction.AccountId
                        )
                        .OnDelete(
                            DeleteBehavior.Cascade
                        );
                }
            );
        }
    }
}