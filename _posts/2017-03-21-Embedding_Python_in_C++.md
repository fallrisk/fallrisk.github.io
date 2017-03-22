---
layout: post
title: Embedding Python in C++
comments: true
---

Embedding Python in C++

This is how I embedded Python in my C++ projects. My goal was to have a console
that would take in Python and eventually plugins in Python that use an embedded
Python module.

I will also show you how to make a module and add it to your embedded Python
console.

# Setup

Get [Visual Studio 15 Express for Desktop](https://www.visualstudio.com/post-download-vs/?sku=xdesk&clcid=0x409&telem=ga#).

"C:\Users\Justin\Documents\Visual Studio 2015\Projects\EmbeddingPythonTutorial"

Get [7-Zip](http://www.7-zip.org/download.html) for compressed file needs.
Get Python 3.6. [Windows x86-64 executable installer](https://www.python.org/ftp/python/3.6.0/python-3.6.0-amd64.exe). Install Python 3.6 to "C:\Python36".

You also need the [GZipped source
tarball](https://www.python.org/ftp/python/3.6.0/Python-3.6.0.tgz). This
provides all the header files we need to reference in our project. Extract the
Gzipped source tarball to your 'C' directory. You should now have "C:/Python-3.6.0".

# Coding

<p align="center">
  <img height="300" src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen.png" width="400">
</p>

<p align="center">
  <img height="300" src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_2.png" width="400" >
</p>

Make sure you have "x64" selected in your "Solution Platforms."

In the EmbeddedPythonTutorial Windows project. Go to the solution explorer pain
and right click the project. Then go to settings in the context menu. Then
in the window that opens go to VC++ directories. Then select "Include Directories".
Add the directory "C:\Python36\include". Add C:\Python36\libs to the "Library Directories."

<p align="center">
  <img height="300" src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_3.png" width="400">
</p>

<p align="center">
  <img height="300" src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_4.png" width="400">
</p>

Copy "C:\Python36\python36.dll" to "C:\Users\Justin\Documents\Visual Studio 2015\Projects\EmbeddingPythonTutorial\EmbeddingPythonTutorial" if this directory
does not exist you just need to run the program in debug mode once and it will
be created.

Now at the top of your file "EmbeddedPythonTutorial.cpp" add the following
code:

```cpp
// This code makes us always use the release version of Python
// even when in debug mode of this program.
// https://pytools.codeplex.com/discussions/547562
#define HAVE_ROUND
#ifdef _DEBUG
#define RESTORE_DEBUG
#undef _DEBUG
#endif
#include <Python.h>
#ifdef RESTORE_DEBUG
#define _DEBUG
#undef RESTORE_DEBUG
#endif
```

This gets around Python trying to use debug code even when we use our project.
Our project only uses the 3.6.0 release version. This tutorial is not for
compiling Python. We are pulling the header file "Python.h" from the directory
we just added to "Include Directories."

Now in the function `wWinMain` add:

```cpp
Py_SetProgramName(L"EmbeddedPythonTutorial");
Py_InitializeEx(0);
```

Your code should look like the following. I have included some code before
and after for you to find the correct location.

```cpp
// Perform application initialization:
if (!InitInstance (hInstance, nCmdShow))
{
    return FALSE;
}

Py_SetProgramName(L"EmbeddedPythonTutorial");
Py_InitializeEx(0);

HACCEL hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_EMBEDDINGPYTHONTUTORIAL));
```

Now you also need to close up Python when your program finishes. To do that
add a call to `Py_Finalize` before the return statement in `wWinMain`.

```cpp
// Close up Python.
Py_Finalize();
```

# Including the Python Libraries

When you end up sending your project out it would be nice not to have to require
the user to install Python 3.6. Well, they do not have to. You can include the
default Python libraries as a ZIP file in your program.

Download "Windows x86 embeddable zip file" this has a python36.zip file inside
of it that has all the Python libraries pre-compiled. We can make our program
use this instead of the files at C:\Python36\Lib. Change the `Py_SetPath`
to use the zip file. Copy the ZIP file to your project directory. Then make
the `Py_SetPath` look like this:

# Testing our Python Setup

```cpp
Py_SetPath(L".\\python36.zip");
```

I have mine setup like the following so that when I am debugging the project the
program is using my local libraries instead of the pre-compiled libraries inside
a ZIP file.

```cpp
#if !defined(_DEBUG)
Py_SetPath(L".\\python36.zip");
#else
Py_SetPath(L"C:\\Python36\\Lib");
#endif
```

At this point you should run the project to make sure we got all of our settings
correct and all of our files in the right place.

Everything should look like this project at this point.

[EmbeddedingPythonTutorial_Part1.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part1.zip)

# Embedded Python Console

Now you will add code to make Python work like a console. In order to do this
we will need to do a little Win32 programming. You need a text box to enter
text for the Python console. You need another text box for the Python results.

## Input Text Box

Inside `WndProc` we will add the code for the input text box. Inside
the switch statement we need to add a new case. Add `case WM_CREATE:` just
above `case WM_COMMAND`. Then inside the `case WM_CREATE` add the
following code:

```cpp
input_text_box = CreateWindowEx(NULL, L"EDIT", NULL,
    WS_CHILD | WS_VISIBLE | ES_LEFT | WS_BORDER,
    // x, y, width, height
    100, 100, 300, 20,
    hWnd, 0, GetModuleHandle(0), 0);
```

Just above the switch statement add the following code:

```cpp
HWND input_text_box;
```

Now run the program. You will see a text box near the left side of the window.
Click in it and type. That where we will insert Python code for your Python
Console. Next you will add the output text box.

<p align="center">
  <img height="300" src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Input_Text_Box.png" width="400">
</p>

## Output Text Box

The output text box will be
able to display multiple lines. Add the following right after the input box
decleration.

```cpp
HWND output_text_box;
```

Now add this code next to the code that created the input text box.

```cpp
output_text_box = CreateWindowEx(NULL, L"EDIT", NULL,
    WS_CHILD | WS_VISIBLE | ES_MULTILINE | ES_AUTOVSCROLL
    | ES_READONLY | WS_VSCROLL | WS_BORDER,
    // x, y, width, height
    100, 140, 300, 100,
    hWnd, 0, GetModuleHandle(0), 0);
```

Run the program. You should see a grayed-out text box below the input text box.
This is our output text box.

## Sending the Input to Python

Sending the input to the Python interperter requires knowing when to take the
input from the user and send it to the Python interperter. You are going to use
the enter key.

In order to capture the enter key press the default window procedure for the
input text box needs to be replaced. Just below the code to create the input
text box add the following:

```cpp
// Change the window procedure for the input text box.
g_default_input_box_proc = (WNDPROC)GetWindowLongPtr(input_text_box, GWLP_WNDPROC);
SetWindowLongPtr(input_text_box, GWLP_WNDPROC, (LONG_PTR)InputBoxProc);
```

At the top of the file in the section of **Global Variables** add the
following:

```cpp
LRESULT CALLBACK InputBoxProc(HWND, UINT, WPARAM, LPARAM);
WNDPROC g_default_input_box_proc;
```

Near the bottom of the file, below the function `About()` add this window
procedure.

```cpp
// Custom input box window procedure.
// This is to trap the enter key.
static LRESULT CALLBACK InputBoxProc(HWND hDlg, UINT message, WPARAM wParam,
    LPARAM lParam)
{
    switch (message)
    {
    case WM_CHAR:
        if (wParam == 13)
        {
            // User pressed ENTER.
            size_t len = 200;
            size_t i;
            wchar_t *buffer = (wchar_t *)malloc(sizeof(wchar_t) * len);
            GetWindowText(hDlg, buffer, 200);
            //wcstombs_s(&i, g_python_input, (size_t)200, buffer, (size_t)len);
            free(buffer);
            //SetEvent(g_python_input_event);
            SetWindowText(input_text_box, L"");
            return 0;
        }
        else
        {
            return ((LRESULT)CallWindowProc((WNDPROC)(g_default_input_box_proc),
                hDlg, message, wParam, lParam));
        }
        break;
    default:
        return ((LRESULT)CallWindowProc((WNDPROC)(g_default_input_box_proc),
            hDlg, message, wParam, lParam));
    }

    return 0;
}
```

Inside the above code do you see the call to statement
`SetWindowText(g_input_window, L"");`? This sets the window text of your
edit box. In order for this to work we need to make the input box a global
variable. Move the code

```cpp
HWND input_text_box;
```

to the globals section near the top of the file. Now run the program. Type
some text into the text box and hit the enter key. The text should disappear.
That's how you know your window procedure is capturing the windows key.

[EmbeddedingPythonTutorial_Part2.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part2.zip)

## Sending the Input to the Python Interperter

To send the input to the Python interperter you must call it with
`[PyRun_String](https://docs.python.org/3.4/c-api/veryhigh.html#c.PyRun_String)`. You can't spend to much time in the GUI thread though doing any
long task. If you do your program will hang and people won't want to use it.
To overcome this you will put the input in a global variable and set an event
for a seperate thread to know there is new input ready.

Include `#include <process.h>`. Add that line to the top of the file. This
provides the functions `_beginthreadex` and `_endthreadex`.

In the `wWinMain` function add the following just after the call to
`Py_InitializeEx(0);`.

```cpp
// Start the Python input thread.
// https://msdn.microsoft.com/en-us/library/kdzttdcb.aspx
g_python_thread_handle = (HANDLE)_beginthreadex(NULL, 0, &PythonThreadFunc,
	NULL, 0, &g_python_thread_id);
SetThreadName(g_python_thread_id, "Python Thread");
```

In between the global variables section and the forward declerations section
add the following code, which creates the varibles needed for your Python
thread:

```cpp
// Python interperter variables:
HANDLE g_python_thread_handle;
unsigned g_python_thread_id;
BOOL g_python_thread_done;
```

In the forward declerations section add the `PythonThreadFunc` prototype.

```cpp
unsigned __stdcall  PythonThreadFunc(void *pArguments);
```

Add code to close up the Python thread right before the code to close Python.

```cpp
// Stop the Python thread.
g_python_thread_done = TRUE;
WaitForSingleObject(g_python_thread_handle, INFINITE);
CloseHandle(g_python_thread_handle);
```

Now you will add the code for the Win32 event. The event will hold the Python
thread in a yielding state until the event is set. Then the Python thread will
run its code. The event lets your thread know there is data ready to be parsed
by Python. The data came from your input box. If you don't use the Win32 event
system and just loop your program will eat all of your CPU. Always follow your
system's event/scheduling mechanisms. That way your CPU isn't just hogged by a
loop. You will add code in a few places to get the event set up. Add code to
the section "Python Interperter Variables" at the top.

```cpp
HANDLE g_python_input_event;
```

Initialize the event in the `wWinMain` just before the `Py_SetPath`
function.

```cpp
g_python_input_event = CreateEvent(NULL, FALSE, FALSE, NULL);
ResetEvent(g_python_input_event);
```

Since our thread will be waiting for this event to run you need to set the event
when you are trying to close the program so the Python thread dies gracefully.
In between where you set the `g_python_thread_done = TRUE;` and where
you close the thread handle (`CloseHandle(g_python_thread_handle);`), set
the event and wait for it. The code should look like this.

```cpp
g_python_thread_done = TRUE;
SetEvent(g_python_input_event);
WaitForSingleObject(g_python_thread_handle, INFINITE);
CloseHandle(g_python_thread_handle);
```

Inside the `PythonThreadFunc` add the code so that the event system waits
for your new Python inpute event, `g_python_input_event`. The code goes
inside the while loop.

```cpp
// Wait for command.
WaitForSingleObject(g_python_input_event, INFINITE);
```

If you set this event in order to close the thread the thread needs code to
check for that and end gracefully.

```cpp
// Make sure we are still working and weren't done and then stuck waiting
// for the "event" to happen.
if (g_python_thread_done) break;
```

Now you need a variable to hold the Python input data when the user hits the
enter key. At the top create a varible named "g\_python\_input".

```cpp
char g_python_input[200];
```

In the `InputBoxProc` you need to uncomment the two lines that were
commented out when we first wrote code there. One writes the text from the
input box to our global Python input variable. The other line sets the event
that you use to tell the thread new input is available.

```cpp
// Check to see if the line is empty. If it is return the prompt and go
// back to waiting.
if (strcmp(g_python_input, "") == 0)
{
    wchar_t out[200];
    // Add the prompt '>>>' to the user's input so it looks like the Python
    // console in the output box.
    swprintf_s(out, 200, L">>> ");
    wcscat_s(out, 300, L"\r\n");
    SetWindowText(output_text_box, (LPARAM)out);
    // Go back to waiting because the input was empty.
    continue;
}
```

For the above code to work the output box needs to be a global variable so that
we have easy access to it. Make the output box global by removing it from the
top of `WndProc` and putting it next to the `input_text_box`. This is
the line you are looking for...

```cpp
HWND output_text_box;
```

Hopefully this section wasn't like [drawing a
horse](https://twitter.com/ossia/status/588389121053200385/photo/1). If it was,
let me know. It was a big step though in getting the infrastructure we need to
handle input and not break the GUI thread. If you entered everything correctly
then hittin enter in the input box should make a '>>>' show up in the output
box. Here is the code up to this point.

[EmbeddedingPythonTutorial_Part3.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part3.zip)

## Getting the Python Output

You will now have Python parse the user's input and return the result. The
result can be an error, nothing, or whatever else you can see when using the
Python console. This part of the project also takes quite a bit of work.

You need to modify the display hook so you can grab the data in a Python
variable.

Inside `PythonThreadFunc` add the following code at the top of the function
above the while loop.

```cpp
// Setup code to modify the displayhook so I can grab it.
// https://www.google.com/search?q=PyRun_String+statement
// http://bytes.com/topic/python/answers/31464-better-way-executing-expression-statement-c
PyRun_SimpleString("import sys");
PyRun_SimpleString("import __main__, traceback, superserial");
PyRun_SimpleString("def my_displayhook(o): __main__.__result=o");
PyRun_SimpleString("def my_excepthook(t,v,b): x=traceback.format_exception(t,v,b); __main__.__traceback=x[0]+x[1]+x[2]");
PyRun_SimpleString("sys.displayhook = my_displayhook");
PyRun_SimpleString("sys.excepthook = my_excepthook");

PyObject *main_module, *global_dict, *local_dict;
main_module = PyImport_AddModule("__main__"); // borrowed reference
global_dict = PyModule_GetDict(main_module);
local_dict = PyDict_New();

PyObject *pyres, *pystr, *pyerr, *pyrunres;
wchar_t pyout[200], pytmp[200];
```

You can find more about
[sys.displayhook](https://docs.python.org/3.6/library/sys.html#sys.displayhook)
and
[sys.excepthook](https://docs.python.org/3.6/library/sys.html#sys.excepthook)
in the Python documentation. These new functions set the value inside of
`__main__`.

You can now grab the results of entering a Python statement by grabbing the
data in the variable `__result` or grab the exception information in
`__traceback`. You will add the code to do this now. Just after the if
statement to check in the user's input was empty append the following code.

```cpp
// Process Python string.
pyrunres = PyRun_String(g_python_input, Py_single_input, global_dict, local_dict);

pyerr = PyErr_Occurred();

if (pyerr != NULL)
{
    PyErr_Print();
    pyres = PyDict_GetItemString(global_dict, "__traceback");
    pystr = PyObject_Str(pyres);
    pystr = PyUnicode_AsEncodedString(pystr, "ASCII", "strict");
    swprintf_s(pytmp, 300, L"%hs\n", PyBytes_AS_STRING(pystr));
    PyErr_Clear();
}
else
{
    pyres = PyDict_GetItemString(global_dict, "__result");
    pystr = PyObject_Str(pyres);
    pystr = PyUnicode_AsEncodedString(pystr, "ASCII", "strict");
    swprintf_s(pytmp, 300, L"%hs", PyBytes_AS_STRING(pystr));

    // Now we need to clear the result.
    PyDict_SetItemString(global_dict, "__result", Py_BuildValue("s", ""));
}

// Return either the result or the traceback.
if (wcscmp(pytmp, L"<NULL>") != 0)
{
    swprintf_s(pyout, 300, L">>> %hs\r\n%s", g_python_input, pytmp);
    SetWindowText(output_text_box, pyout);
}
else
{
    swprintf_s(pyout, 300, L">>> %hs", g_python_input);
    SetWindowText(output_text_box, pyout);
}

// Clear the python input buffer.
memset(g_python_input, '\0', 300);
```

Run the program and type the following as two seperate commands.

```python
x = 4
```

```python
x
```

You should see the output:

```python
>>> x
4
```

The code at this point is [EmbeddedingPythonTutorial_Part4.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part4.zip).

# Adding a Python Module

You are going to make a custom module and add it to your embedded Python
console system. You will be able to make calls to the embedded module through
your Python input box.

