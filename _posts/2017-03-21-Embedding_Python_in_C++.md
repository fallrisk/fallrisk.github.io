---
layout: post
title: Embedding Python in C++
comments: true
---

Embedding Python in C++

This is how I embedded Python in my C++ projects. My goal was to have a console
that would take in Python in a REPL fashion. I also wanted plugins in Python
that use an embedded Python module; embedded inside the program. I will also
show you how to make such a module and add it to your embedded Python console.

# Setup

Get [Visual Studio 15 Express for Desktop](https://www.visualstudio.com/post-
download-vs/?sku=xdesk&clcid=0x409&telem=ga#) from Microsoft's website. Get
[7-Zip](http://www.7-zip.org/download.html) for extracting compressed files.
Get Python 3.6.
[Windows x86-64 executable installer](https://www.python.org/ftp/python/3.6.0/python-3.6.0-amd64.exe).
Install Python 3.6 to "C:\Python36". This provides all the header files you need
to reference in our project. It also has the "python36.dll" you will need to
copy to your project. You also need the [Windows x86-64 embeddable zip file](https://www.python.org/ftp/python/3.6.0/python-3.6.0-embed-amd64.zip). Extract
the Gzipped source tarball to your 'C' directory. You should now have
"C:\python-3.6.0-embed-amd64". This has the standard library pre-compiled in a ZIP file.
The pre-compiled ZIP file can be used to include with your project when you
ship it.

# Coding

Open Visual Studio 2015 and create a new C++ Win32 Project. The template is
under Templates/VisualC++/Win32 in the tree on the left side of the create
project menu. It will look like this:

<p align="center">
    <a href="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen.png">
        <img alt="Project creation screen."
           height="300" style="display:block;width:100%;max-width:600px"
           src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen.png"
           width="400">
    </a>
</p>

My project directory is "C:\Users\Justin\Documents\Visual Studio
2015\Projects\EmbeddingPythonTutorial". Your project directory will be similar.
Once you click next you will see a screen similar to this:

<p align="center">
    <a href="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_2.png">
        <img alt="Win32 application wizard."
           height="300" style="display:block;width:100%;max-width:600px"
           src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_2.png"
           width="400">
    </a>
</p>

In the EmbeddedPythonTutorial Windows project. Go to the solution explorer pain
and right click the project. Then go to settings in the context menu. Then
in the window that opens go to VC++ directories. Then select "Include Directories".
Add the directory "C:\Python36\include". Add C:\Python36\libs to the "Library Directories."

<p align="center">
    <a href="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_3.png">
        <img alt="VC++ directory settings."
           height="300" style="display:block;width:100%;max-width:600px"
           src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_3.png"
           width="400">
    </a>
</p>

Click "OK" and you will be back in the project screen. At the top of the IDE
make sure you have "x64" selected in your "Solution Platforms."

<p align="center">
    <a href="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_4.png">
        <img alt="VC++ directory settings."
           height="300" style="display:block;width:100%;max-width:600px"
           src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Project_Screen_4.png"
           width="400">
    </a>
</p>

Copy "C:\Python36\python36.dll" to "C:\Users\Justin\Documents\Visual Studio
2015\Projects\EmbeddingPythonTutorial\EmbeddingPythonTutorial" if this
directory does not exist you just need to run the program in debug mode once
and it will be created.

At the top of your file "EmbeddedPythonTutorial.cpp" add the following
code:

{% highlight cpp %}
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
{% endhighlight %}

This gets around Python trying to use debug code even when you use your project
in debug mode. Our project only uses the 3.6.0 release version. This tutorial
is not for compiling Python. We are pulling the header file "Python.h" from the
directory you just added to "Include Directories." The "Python.h" file has all
the `Py_` functions you will need for this project.

Now in the function `wWinMain` add:

{% highlight cpp %}
Py_SetProgramName(L"EmbeddedPythonTutorial");
Py_InitializeEx(0);
{% endhighlight %}

Your code should look like the following. I have included some code before
and after for you to find the correct location.

{% highlight cpp %}
// Perform application initialization:
if (!InitInstance (hInstance, nCmdShow))
{
    return FALSE;
}

Py_SetProgramName(L"EmbeddedPythonTutorial");
Py_InitializeEx(0);

HACCEL hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_EMBEDDINGPYTHONTUTORIAL));
{% endhighlight %}

Now you also need to close up Python when your program finishes. To do that
add a call to `Py_Finalize` before the return statement in `wWinMain`.

{% highlight cpp %}
// Close up Python.
Py_Finalize();
{% endhighlight %}

# Including the Python Libraries

When you end up sending your project out it would be nice not to have to require
the user to install Python 3.6. Well, they do not have to. You can include the
default Python libraries as a ZIP file in your program.

Download "Windows x86 embeddable zip file" this has a python36.zip file inside
of it that has all the Python libraries pre-compiled. You can make your program
use this instead of the files at C:\Python36\Lib. Change the `Py_SetPath`
to use the zip file. Copy the ZIP file to your project directory. Then make
the `Py_SetPath` look like this:

# Testing our Python Setup

Set the library path for your embedded Python. This code goes inside the
function `wWinMain` above the line `Py_SetProgramName`.

{% highlight cpp %}
Py_SetPath(L".\\python36.zip");
{% endhighlight %}

I have mine setup like the following so that when I am debugging the project the
program is using my local libraries instead of the pre-compiled libraries inside
of a ZIP file.

{% highlight cpp %}
#if !defined(_DEBUG)
Py_SetPath(L".\\python36.zip");
#else
Py_SetPath(L"C:\\Python36\\Lib");
#endif
{% endhighlight %}

At this point you should run the project to make sure you got all of our
settings correct and all of our files in the right place. Note the path used if
the program is not in debug. It will be the file "python36.zip" you must copy
that file from "C:\python-3.6.0-embed-amd64\python36.zip" to the same directory
that your executable is. You must also ship the file "python36.zip" with your
program and the python36.dll in order for it to work on someone else's machine.

Everything should look like this project at this point.

[EmbeddedingPythonTutorial_Part1.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part1.zip)

# Embedded Python Console

Now you will add code to make Python work like a console. In order to do this
you will need to do a little Win32 programming. You need a text box to enter
text for the Python console. You need another text box for the Python results.

## Input Text Box

Inside `WndProc` you will add the code for the input text box. Inside
the switch statement you need to add a new case. Add `case WM_CREATE:` just
above `case WM_COMMAND`. Then inside the `case WM_CREATE` add the
following code:

{% highlight cpp %}
input_text_box = CreateWindowEx(NULL, L"EDIT", NULL,
    WS_CHILD | WS_VISIBLE | ES_LEFT | WS_BORDER,
    // x, y, width, height
    100, 100, 300, 20,
    hWnd, 0, GetModuleHandle(0), 0);
{% endhighlight %}

Just above the switch statement add the following code:

{% highlight cpp %}
HWND input_text_box;
{% endhighlight %}

Now run the program. You will see a text box near the left side of the window.
Click in it and type. That is where you will insert Python code for your Python
Console. Next you will add the output text box.

<p align="center">
    <a href="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Input_Text_Box.png">
        <img alt="Screenshot of input box."
           height="300" style="display:block;width:100%;max-width:600px"
           src="https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial-Input_Text_Box.png"
           width="400">
    </a>
</p>

## Output Text Box

The output text box will be
able to display multiple lines. Add the following right after the input box
decleration.

{% highlight cpp %}
HWND output_text_box;
{% endhighlight %}

Now add this code next to the code that created the input text box.

{% highlight cpp %}
output_text_box = CreateWindowEx(NULL, L"EDIT", NULL,
    WS_CHILD | WS_VISIBLE | ES_MULTILINE | ES_AUTOVSCROLL
    | ES_READONLY | WS_VSCROLL | WS_BORDER,
    // x, y, width, height
    100, 140, 300, 100,
    hWnd, 0, GetModuleHandle(0), 0);
{% endhighlight %}

Run the program. You should see a grayed-out text box below the input text box.
This is our output text box.

## Sending the Input to Python

Sending the input to the Python interperter requires knowing when to take the
input from the user and send it to the Python interperter. You are going to use
the enter key.

In order to capture the enter key press the default window procedure for the
input text box needs to be replaced. Just below the code to create the input
text box add the following:

{% highlight cpp %}
// Change the window procedure for the input text box.
g_default_input_box_proc = (WNDPROC)GetWindowLongPtr(input_text_box, GWLP_WNDPROC);
SetWindowLongPtr(input_text_box, GWLP_WNDPROC, (LONG_PTR)InputBoxProc);
{% endhighlight %}

At the top of the file in the section of **Global Variables** add the
following:

{% highlight cpp %}
LRESULT CALLBACK InputBoxProc(HWND, UINT, WPARAM, LPARAM);
WNDPROC g_default_input_box_proc;
{% endhighlight %}

Near the bottom of the file, below the function `About()` add this window
procedure.

{% highlight cpp %}
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
{% endhighlight %}

Inside the above code do you see the call to statement
`SetWindowText(g_input_window, L"");`? This sets the window text of your
edit box. In order for this to work you need to make the input box a global
variable. Move the code

{% highlight cpp %}
HWND input_text_box;
{% endhighlight %}

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

{% highlight cpp %}
// Start the Python input thread.
// https://msdn.microsoft.com/en-us/library/kdzttdcb.aspx
g_python_thread_handle = (HANDLE)_beginthreadex(NULL, 0, &PythonThreadFunc,
	NULL, 0, &g_python_thread_id);
SetThreadName(g_python_thread_id, "Python Thread");
{% endhighlight %}

In between the global variables section and the forward declerations section
add the following code, which creates the varibles needed for your Python
thread:

{% highlight cpp %}
// Python interperter variables:
HANDLE g_python_thread_handle;
unsigned g_python_thread_id;
BOOL g_python_thread_done;
{% endhighlight %}

In the forward declerations section add the `PythonThreadFunc` prototype.

{% highlight cpp %}
unsigned __stdcall  PythonThreadFunc(void *pArguments);
{% endhighlight %}

Add code to close up the Python thread right before the code to close Python.

{% highlight cpp %}
// Stop the Python thread.
g_python_thread_done = TRUE;
WaitForSingleObject(g_python_thread_handle, INFINITE);
CloseHandle(g_python_thread_handle);
{% endhighlight %}

Now you will add the code for the Win32 event. The event will hold the Python
thread in a yielding state until the event is set. Then the Python thread will
run its code. The event lets your thread know there is data ready to be parsed
by Python. The data came from your input box. If you don't use the Win32 event
system and just loop your program will eat all of your CPU. Always follow your
system's event/scheduling mechanisms. That way your CPU isn't just hogged by a
loop. You will add code in a few places to get the event set up. Add code to
the section "Python Interperter Variables" at the top.

{% highlight cpp %}
HANDLE g_python_input_event;
{% endhighlight %}

Initialize the event in the `wWinMain` just before the `Py_SetPath`
function.

{% highlight cpp %}
g_python_input_event = CreateEvent(NULL, FALSE, FALSE, NULL);
ResetEvent(g_python_input_event);
{% endhighlight %}

Since our thread will be waiting for this event to run you need to set the event
when you are trying to close the program so the Python thread dies gracefully.
In between where you set the `g_python_thread_done = TRUE;` and where
you close the thread handle (`CloseHandle(g_python_thread_handle);`), set
the event and wait for it. The code should look like this.

{% highlight cpp %}
g_python_thread_done = TRUE;
SetEvent(g_python_input_event);
WaitForSingleObject(g_python_thread_handle, INFINITE);
CloseHandle(g_python_thread_handle);
{% endhighlight %}

Inside the `PythonThreadFunc` add the code so that the event system waits
for your new Python inpute event, `g_python_input_event`. The code goes
inside the while loop.

{% highlight cpp %}
// Wait for command.
WaitForSingleObject(g_python_input_event, INFINITE);
{% endhighlight %}

If you set this event in order to close the thread the thread needs code to
check for that and end gracefully.

{% highlight cpp %}
// Make sure we are still working and weren't done and then stuck waiting
// for the "event" to happen.
if (g_python_thread_done) break;
{% endhighlight %}

Now you need a variable to hold the Python input data when the user hits the
enter key. At the top create a varible named "g\_python\_input".

{% highlight cpp %}
char g_python_input[200];
{% endhighlight %}

In the `InputBoxProc` you need to uncomment the two lines that were
commented out when you first wrote code there. One writes the text from the
input box to our global Python input variable. The other line sets the event
that you use to tell the thread new input is available.

{% highlight cpp %}
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
{% endhighlight %}

For the above code to work the output box needs to be a global variable so that
you have easy access to it. Make the output box global by removing it from the
top of `WndProc` and putting it next to the `input_text_box`. This is
the line you are looking for...

{% highlight cpp %}
HWND output_text_box;
{% endhighlight %}

Hopefully this section wasn't like [drawing a
horse](https://twitter.com/ossia/status/588389121053200385/photo/1). If it was,
let me know. It was a big step though in getting the infrastructure you need to
handle input and not break the GUI thread. If you entered everything correctly
then hitting enter in the input box should make a `>>>` show up in the output
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

{% highlight cpp %}
// Setup code to modify the displayhook so I can grab it.
// https://www.google.com/search?q=PyRun_String+statement
// http://bytes.com/topic/python/answers/31464-better-way-executing-expression-statement-c
PyRun_SimpleString("import sys");
PyRun_SimpleString("import __main__, traceback");
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
{% endhighlight %}

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

{% highlight cpp %}
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
{% endhighlight %}

Run the program and type the following as two seperate commands.

{% highlight python %}
x = 4
{% endhighlight %}

And then...

{% highlight python %}
x
{% endhighlight %}

You should see the output:

{% highlight python %}
>>> x
4
{% endhighlight %}

Now enter "z" into your text box. You should see the following traceback in
your output box.

{% highlight python %}
>>> z
Traceback (most recent call last):
  File "<string>", line 1, in <module>
NameError: name 'z' is not defined
{% endhighlight %}

This means you have our embedded Python console set up correctly. The code at
this point is [EmbeddedingPythonTutorial_Part4.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part4.zip).

# Adding a Python Module

You are going to make a custom module and add it to your embedded Python
console system. You will be able to make calls to the embedded module through
your Python input box.

Create a new file in the solution by hitting the hot key `Ctrl+Shift+A`. Select
"Visual C++" in the tree on the left and then select "C++ File". Now in the
"Name" box at the bottom, enter "awesome_module.cpp". Click "Add". Enter
`Ctrl+Shift+A` again to add another file to the project. Select "Header File",
and enter "awesome_module.h" for the name. Click "Add". Now go to the header
file "awesome_module.h". Enter this code:

{% highlight cpp %}
#ifndef AWESOME_MODULE_H_
#define AWESOME_MODULE_H_

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

#ifdef __cplusplus
extern "C" {
#endif

extern PyObject* PyInit_awesome(void);

#ifdef __cplusplus
}
#endif

#endif
{% endhighlight %}

Now go to the source file "awesome_module.cpp". Add the following code:

{% highlight cpp %}
#include "stdafx.h"
#include <Windows.h>

#include "awesome_module.h"

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

static PyObject *AwesomeError;

PyMethodDef awesome_methods[] =
{
    { NULL, NULL, 0, NULL } /* Sentinel */
};

static struct PyModuleDef awesome_module =
{
    PyModuleDef_HEAD_INIT,
    "awesome",               /* Module Name */
    NULL,                    /* Module Documentation (may be NULL) */
    -1,
    awesome_methods
};

PyObject* PyInit_awesome(void)
{
    PyObject *m;
    m = PyModule_Create(&awesome_module);

    if (m == NULL)
        return NULL;

    // Add the "awesome" exception.
    AwesomeError = PyErr_NewException("awesome.error", NULL, NULL);
    Py_INCREF(AwesomeError);
    PyModule_AddObject(m, "error", AwesomeError);

    PyModule_AddStringConstant(m, "best_actor", "Sylvester Stalone");
    PyModule_AddStringConstant(m, "best_movie", "A Bug's Life");

    return m;
}
{% endhighlight %}

All of this code come from following the Python lesson on
[extending: A Simple Example](https://docs.python.org/3.6/extending/extending.html#a-simple-example). More information is in the
[Extending/Embedding FAQ](https://docs.python.org/3/faq/extending.html)
Refer to this if these documents if you want to keep adding to your module. You
can add more variables and functions to your module.

Go to your "EmbeddingPythonTutorial.cpp" file. Add the module header file to
your "EmbeddingPythonTutorial.cpp" file. Add the following code just below
the `#include "EmbeddingPythonTutorial.h"`.

{% highlight cpp %}
#include "awesome_module.h"
{% endhighlight %}

Now you need to have Python import the module. Go to where we call
`Py_SetPath` in `wWinMain`. Add the call to `PyImport_AppendInitTab` just
above it.

{% highlight cpp %}
PyImport_AppendInittab("awesome", PyInit_awesome);
{% endhighlight %}

This tell Python where to find the module "awesome". Python knows the module is
avaiable at that `PyInit` function. The embedded console must still call
`import awesome` in order to have the module available. Go down to the function
`PythonThreadFunc`. Modify the line `PyRun_SimpleString("import __main__")...`
to look like this:

{% highlight cpp %}
PyRun_SimpleString("import __main__, traceback, awesome");
{% endhighlight %}

Run the program. In your input box type `awesome.best_actor` you should see

{% highlight python %}
>>> awesome.best_actor
Sylvester Stalone
{% endhighlight %}

Now you have the foundation of an embedded module to extend your embedded
Python console. The code at this point is
[EmbeddingPythonTutorial_Part5.zip](https://s3-us-west-1.amazonaws.com/fallrisk.de/justinwatson.name/EmbeddingPythonTutorial_Part5.zip).
