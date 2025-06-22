# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything for restore and build
COPY EmailAppBackend/ ./EmailAppBackend/        

WORKDIR /src/EmailAppBackend
RUN dotnet restore

# Build and publish the app
RUN dotnet publish EmailAppBackend.csproj -c Release -o /app/publish --no-restore

# Use the official .NET runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "EmailAppBackend.dll"]