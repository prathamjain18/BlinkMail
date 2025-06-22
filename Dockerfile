# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY BlinkMail/EmailAppBackend/EmailAppBackend.csproj ./BlinkMail/EmailAppBackend/
WORKDIR /src/BlinkMail/EmailAppBackend
RUN dotnet restore EmailAppBackend.csproj

# Copy the rest of the source code
COPY . .

# Build and publish the app
RUN dotnet publish EmailAppBackend.csproj -c Release -o /app/publish --no-restore

# Use the official .NET runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "EmailAppBackend.dll"]