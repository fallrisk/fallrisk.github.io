---
layout: post
title: Setting up pydot for Python 3.5 and Keras, Conda, and Windows 64
comments: false
---

Setting up pydot for Python 3.5 and Keras, Conda, and Windows 64

In Keras you can use the function [keras.utils.visualize_util.plot](https://keras.io/visualization/)
to create a image of your model.

The problem is getting the function to not throw an error that looks like the
following:

```
AttributeError: 'module' object has no attribute 'find_graphviz'
```

I went through several stackoverflow questions and forums to figure out what
to do. [This page](https://github.com/Theano/Theano/issues/1801) had the most
useful information. I ended up doing the following:

1. Install [graphviz for windows](http://www.graphviz.org/Download_windows.php) from the graphviz website.

2. Add the directory bin of Graphviz to your environment variable "PATH".

2. Install [pydot_ng](https://github.com/pydot/pydot-ng) in conda using the following command:

```bash
> pip install git+https://github.com/pydot/pydot-ng.git
```

3. Install Graphviz for Python 3.5.

```bash
> pip install graphviz
```

After you have done the previous steps you should see similar output after
running the following command:

```
Python 3.5.2 | packaged by conda-forge | (default, Jul 26 2016, 02:06:09) [MSC v.1900 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> import pydot_ng as pydot
>>> print(pydot.find_graphviz())
{'neato': 'C:\\Program Files (x86)\\Graphviz2.38\\bin\\neato.exe', 'twopi': 'C:\\Program Files (x86)\\Graphviz2.38\\bin\\twopi.exe', 'sfdp': 'C:\\Program Files (x86)\\Graphviz2.38\
\bin\\sfdp.exe', 'fdp': 'C:\\Program Files (x86)\\Graphviz2.38\\bin\\fdp.exe', 'dot': 'C:\\Program Files (x86)\\Graphviz2.38\\bin\\dot.exe', 'circo': 'C:\\Program Files (x86)\\Grap
hviz2.38\\bin\\circo.exe'}
>>>
```

# Extra Information
If you look at the code for Keras [here](https://github.com/fchollet/keras/blob/master/keras/utils/visualize_util.py).
You can see that Keras handles "pydot_ng", which works with Python 3.5.

# Other References
* http://stackoverflow.com/questions/38446771/importing-theano-attributeerror-module-object-has-no-attribute-find-graphvi
* https://stackoverflow.com/questions/36886711/keras-runtimeerror-failed-to-import-pydot-after-installing-graphviz-and-pyd/36890526#36890526
