@echo off
set "DIR=%~dp0"
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Android\Android Studio1\jbr\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio1\jbr"
    )
)
"%DIR%..\tools\apache-maven-3.9.6\bin\mvn.cmd" %*
