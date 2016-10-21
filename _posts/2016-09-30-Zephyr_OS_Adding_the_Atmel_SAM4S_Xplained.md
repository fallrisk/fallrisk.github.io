---
layout: post
title: Zephyr OS Adding the Atmel SAM4S Xplained
comments: true
---

Zephyr OS: Adding the Atmel SAM4S Xplained

by Justin Watson 2016 Sept. 30

This is an article on adding the Atmel SAM4S Xplained board to the [Zephyr
Operating System](https://www.zephyrproject.org/). We will start with the board
code and continue with the SoC code. Then we will look at building and
installing the binary file "zephyr.bin". It is recommended to have the data
sheet, schematic and docs available for reference as they will be needed
extensively. One of the goals is to show how to figure out what your board and
SoC need in order to be added to the Zephyr OS.

# Materials

* [TTL to USB device 3.3 Volts](https://www.sparkfun.com/products/9873)
* Atmel SAM4S Xplained

# Board

First we collect all the information on the [Atmel
SAM4S16C](http://www.atmel.com/devices/ATSAM4S16C.aspx) and the
[board](http://www.atmel.com/tools/SAM4S-XPLD.aspx) Get the [data
sheet](http://www.atmel.com/Images/Atmel-11100-32-bit%20Cortex-M4
-Microcontroller-SAM4S_Datasheet.pdf) for the SAM4S16C. Also open up the [Online
User Guide](http://www.atmel.com/webdoc/sam4s16xplained/index.html) and the
[board files](http://www.atmel.com/tools/SAM4S-XPLD.aspx?tab=documents). We next
create the board directory "atmel\_sam4s\_xpld" inside the directory
<z/boards/>. Then we will copy the files from the directory
<z/boards/arduino_due/> into the new directory <z/boards/atmel\_sam4s\_xpld/>.
We then modify the file name for the file "arduino\_due\_defconfig" to
"atmel\_sam4s\_xpld\_defconfig. Then we start the modifications for our board
with the file "atmel\_sam4s\_xpld\_defconfig". Now each section is a file that
we copied from the SAM3.

## atmel\_sam4s\_xpld_defconfig

We need to update all part references from SAM3 to SAM4, and all chip references
of SAM3XAE to SAM4S16.

## board\.h

No change needed.

## Kconfig\.board

In the file "Kconfig.board" we will change the config "BOARD\_ARDUINO\_DUE" to
BOARD\_ATMEL\_SAM4S\_XPLD. We will also change the prompt for the bool value to
"Atmel SAM4S Xplained". The depends statement need to be updated to the SoC on
the SAM4S XPLD. This chip/soc configuration doesn't exist yet in
<z/arch/arm/soc/>. It will after we finish with the board configuration. The
chip on the SAM4S Xplained is the SAM4S16. So we change the depends statement to
that, SOC\_ATMEL\_SAM4S16.

## Kconfig\.defconfig

On this file we need to change the "if" statement board variable to match the
board variable we created in the file "Kconfig\.board". So we change it to
BOARD\_ATMEL\_SAM4S\_XPLD. We will also change the option "default" from
"arduino\_due" to "atmel\_sam4s\_xpld".

## Makefile

The file Makefile requires no changes.

## pinmux\.c

This file does adds a function to the OS that sets up some pin configurations
specific to the board. Our chip though only has 3 PIOs, A, B, and C. So all
parts in this file that have to do with D can be removed.

If you look at section 31.6.24 you can see that this chip has 4 possible
settings instead of 2. The chip has A, B, C, or D, while the SAM3S only has A
and B. Section 11.2 has a table of what the A, B, C, and D functions do for the
different pins. The \_\_PIOm (m is A, B, C, etc.) structures come from the file
<z/arch/arm/soc/atmel\_sam3/> which defines a bunch of helpful structures. We
will be making our own similar file inside the directory
<z/arch/arm/soc/atmel\_sam4/> in the SoC section of this article.

Now just after all the defaults have been read we will modify the code to what
the board has the pins connected too. We read all the settings so we have a
copy. Then we modify our copy and then push the changes back.

Side question: Why do we do this instead of just changing the pins directly?

The JTAG pins are the first pin setup we come to. The code is setting the JTAG
pins to 0 on the control (enable) register. On the table in 11.2 you see that
the system setting for those pins is TDI, TDO, etc. We disable the Peripheral
Mux on those pins so that those pins are in the system setting. PB2 and PB3 are
tied to J1 and J4 so they will be easily accessible for UART to a TTL to USB
device. Remove the sections for the I2C and the ADC pins. We don't need them for
our board.

Side question: Why do these pins get setup in the board file and not the
application file or not as a driver?

# SoC/Chip

The Zephyr OS uses the term SoC to refer to the chip. SoC stands for System on
Chip. I use the word chip and SoC interchangably throughout this file. They mean
exactly the same thing. The terms refer to the actual chip and only the chip.
The terms do not refer to the board or the architecture.

I copied the directory <atmel\_sam3/> in <z/arch/arm/soc/>. Then I renamed the new
copy to atmel\_sam4.

## Kconfig

Lets start with the file Kconfig. Change all the parts in the file that say SAM3
to SAM4.

The config. SOC\_ATMEL\_SAM4\_EXT\_SLCK is for setting the clock to an external
clock. The possible clock options for our chip the SAM4S16 are in section 28.
The data sheet states that there are two PLLs, PLLA and PLLB. I copied the PLLA
config blocks and renamed the copies to PLLB.

## Kconfig.defconfig

IRQ stands for interrupt. The two words can be used interchangable. Configure
the number of interrupt (IRQ) priority bits. The data sheet in section 12.8 has a
bullet point that says the IRQs have a programmable priority level from 0 to 15.
The numbers 0 to 15 would require for bits, therefore the number of priority
bits is 4. Configure the number of IRQs to 35. This was found in section 12.8 on
page 196.

Now we need to modify the config SYS\_CLOCK\_HW\_CYCLES\_PER\_SEC. First we must
determine how the 84 MHz was found on the Arduino Due. Then we can follow the
same process to determine the clock for the Atmel SAM4S. The config
SOC\_ATMEL\_SAM3\_PLLA\_MULA is set to 0x06 and the SOC\_ATMEL\_SAM3\_PLLA\_DIVA
is set to 0x01. In section 27.6.1 we find the same equation in "help" section of
the config. The equation (MAINCK * (MULA + 1) / DIVA). The Arduino Due schematic
shows a 12 MHz clock connected to Xin and Xout. Solving that equation with the
settings above we get:

```
(12,000,000 * (6 + 1) / 1) = 84,000,000
```

THis means the default settigns for MULA and DIVA in this PLL equation result in
the SYS\_CLOCK\_HW\_CYCLES\_PER\_SEC value. Now doing the same analysis for the
SAM4S Xplained board we can find the value we should set our
SYS\_CLOCK\_HW\_CYCLES\_PER\_SEC to. The SAM4S Xplained board also has a 12 MHz
connected to Xin and Xout. The SAM4S has 2 PLLs though. This can be seen in
Figure 29-2 page 517 of the SAM4S data sheet. We should also note that the clock
system on both processors has a prescaler for the master clock (section 28.3,
page 527, SAM4S data sheet). There is no Zephyr OS configuration for the master
clock preclaer so it is left at it default of 1. The master clock prescaler is
configured in the file "soc.c". We can verify that it is at its default value by
looking at the code in the section with the comment "Setup Prescaler".

We will remove the I2C block because we don't need it to get the board running.
We can add it back in later. We will also remove the config
GPIO\_ATMEL\_SAM4\_PORTD because there is no PORT D on the SAM4S.

## Kconfig\.soc

First we will change the processor name to 4S16 from 3X8E on the lines for
"config" and "bool." Then in the select we must change the CPU\_CORTEX\_M3 to
CPU\_CORTEX\_M4 because the SAM4S16 processor is a Cortex M4. This can be
verified by look in the data sheet section 12. Changing this to M4 might also
require adding more information to the architecture code for M4. We can look
into this later by looking for where the CPU\_CORTEX\_M3 is defined and used.
Now we must change the SOC\_ATMEL\_SAM3 to SOC\_ATMEL\_SAM4 because our
processor is a SAM4. The next select statement is for
SYS\_POWER\_LOW\_POWER\_STATE\_SUPPORTED. We need to look for where this is
defined and used. We also need to check the data sheet to see if it is
supported.

## Linker\.ld

This file includes <z/arch/arm/cortex\_m/script/linker.ld>. This included
file "linker.ld" uses definitions to describe where code and text should go.
Since we have been changing definitions to match our processor from the
SAM3X8E our settings will be used and this ensures that we have the
correct definitions defined.

## Makefile

We will leave this file alone because we aren't adding any new source files.

## File soc\.c

This file will require a lot of changes. It will also help us understand how a
lot of the settings in the other files are used. We may end up changing some of
them in this section. Hopefully you read the sections in order. Otherwise, these
changes will not make sense. All sections of the code need to be compared
between the data sheets for the SAM3 and SAM4.

Lets start with the first "config" block CONFIG\_SOC\_ATMEL\_SAM4\_EXT\_SLCK.
Our chip has this same setup as the SAM3. So we will leave the block in. We also
have this still in our kernel configuration. file Kconfig. This code allows the
Slow Clock to be set to use an external clock. We find that the Supply
Controller SUPC allows this in the SAM3 so we will check the same section of the
SAM4 data sheet. The Supply Controller Control Register has similar bits. We
must also check the Supply Controller structure's start address. On the SAM3 it
can be seen that the supply controller start address is 0x400E1A10. This is
verified by looking at the Supply Controller Control Register's address in the
data sheet and table 16.5.2. The control register is offset 0 so the control
register marks the beginning of the SUPC registers. By investigating the same
section of the SAM4, which is now section 18. We see that in table 18-2 the
Supply Controller Control Register is offset 0 and thus marks the beginning of
the Supply Controller structure defined in the file soc.h. The Supply Controller
Control Register on the SAM4 is at address 0x400E1410. So we must change that
SUPC\_ADDR in our SAM4 file soc.h.

The next code to look at is the config block
CONFIG\_SOC\_ATMEL\_SAM3\_EXT\_MAINCK. Here we need to do a similar thing with
the last "config" block and ensure we have the correct addresses and a similar
register structure as the SAM3. Basically fixing the code to meet the SAM4. The
PMC is Power Management Controller section 29. There we see Table 29-3 shows
offset 0 is the System Clock Enable Register. The System Clock Enable Register
is located at address 0x400E0400. So we update the file soc.h again.

Now we are at the part of code that sets up PLLA as the master clock. We
should continue to use this because it is already there and tested with the SAM3.
At this point there is no good reason to not use PLLA and the default
configuration settings. This whole block uses the PMC so we know we have the
register addresses correct because we set them up earlier while modifying this
file. You should read the section on changing clocks to improve your
understanding of what this code is doing.

Next is the function "atmel\_sam3\_init". Change the name to "atmel\_sam4_init".
First thing we see that we can configure is the use of
CONFIG\_FLASH\_BASE\_ADDRESS we did this in the Kconfig file.

Next is the setup of the flash controller. Go to the SAM4 data sheet section 20
on the Enhanced Embedded Flash Controller EEFC. There we can look up what the
"fm" register is. Looks like it is flash mode. In the address we see one address
for bank 0 and one for bank 1. We need to check these in our soc.h file and
update them if they are different than the SAM3. They aren't different so no
update is needed. This code is changing the flash wait state FWS. We should
leave this alone since we are matching clocks and the Zephyr team probably did
some checking against a real Arudino Due. EEFC information is in section 20.5.1
page 371.

Now we come to a handful of SCB functions. SCB stands for System Control Block.
In the SAM4 data sheet the System Control Block is found in section 12.9. Give
this a read sometime so you are more familiar with what those functions are
doing at boot.

Next we see the call to the clock\_init function we modified earlier. We can
leave this alone because we already checked it.

Then we see the watchdog setup, which just disables the watchdog. We need to
update it's address if it different than the SAM3. Steps to do that are similar
to those above for other register addresses. The Watchdog Timer is in section 17
of the SAM4 data sheet.

We will finish this file by updating the call to "atmel\_sam3\_init" to
"atmel\_sam4\_init."

## File soc\.h

First we see the "#ifndef" and "#define". Change those to SAM4 from SAM3.

Next we see the IRQ numbers. The IRQ information can be found in section 11
Peripherals in table 11-1. Compare them and add those IRQs that don't exist in
the table and modify those that have a different number from the number in the
SAM3. For example there are now two UARTs.

Now we can update the PID definitions. First copy and pase the IRQs and change
the name IRQ to PID. Now go to section 29.17. Notice there are two peripheral
clock enable registers, 0 and 1. We only need definitions for those PIDs listed
in either of those registers.

Next is the PMC address, which we alrady set when updating the file soc.c.

We also notice that there is only a definition for PLLA in the soc.h file. We
need to copy this PLL code block and change the variable names accordingly for
PLLB.

Now we have the UART to update. There are also now two UARTs. We saw this when
making the IRQ definitions. UART table of registers is in Table 35-4 page 768.
First register is the Control Register. Control Register for UART0 is located at
0x400E0600 and the address for UART1 is 0x400E0800. Update the UART section in
the file soc.h.

We already updated the EEFC when we updated the soc.c file.

The Peripheral DMA Controller is next for verification and is in chapter 27.
These read as if they are part of the Peripheral Transter Control Register
based on the name on page 27.6.9. They are so these definitions are OK.

PIO Controllers are next for verification. PIO is in chapter 31. The table is
table 31-5 on page 585. Offset 0 is the PIO Enable Register. Look at the PIO
enable register we can see there is only PIOA, PIOB, and PIOC. The rest can
be removed.

The SUPC address was updated in the "soc.c" file.

The Two-wire Interface TWI is in section 34. Offset 0 is the control register.
Looking at the control register we see the address for TWI0 and TWI1. Update
their definitions.

The Watchdog Timer WDT address was updated in the "soc.c" file.

Below that are where the addresses are applied to the structures that provide
an easier interface. We can remove the PIOD, PIOE, and PIOF structures. We
can leave the rest because they do exist and are used in the soc.c file.

## soc_registers\.h

This file is a bunch of structures that make it easier and more organized when
working with the SOC registers. I went through each of these and verified their
offsets being correct. I suggest you do the same. We have already glanced at the
chapter and table for all the registers listed in the "soc\_registers.h" file.

# Known Unknowns in the Board Kconfig File

Take a look at the file <z/arch/arm/defconfig>. We have several settings set to
"yes" by default that we may need to create a driver for. We should also take a
look at the "defconfig" file in our "atmel\_sam4s\_xpld" directory for other
options with a "yes" as their setting. Specifically we should look at the
options that we haven't seen used in any of the files in the board's directory
or the SoC's directory. In that file we see:

```ini
CONFIG_ARM=y
CONFIG_SOC_ATMEL_SAM3X8E=y
CONFIG_BOARD_ARDUINO_DUE=y
CONFIG_CORTEX_M_SYSTICK=y
CONFIG_CONSOLE=y
CONFIG_UART_CONSOLE=y
CONFIG_SERIAL=y
CONFIG_UART_ATMEL_SAM3=y
CONFIG_SOC_ATMEL_SAM3_EXT_MAINCK=y
CONFIG_PINMUX=y
```

Here are the configuration options again with the file we saw them used in.

```ini
CONFIG_ARM=y
CONFIG_SOC_ATMEL_SAM3X8E=y          soc/Kconfig.soc: selects several other options
CONFIG_BOARD_ARDUINO_DUE=y
CONFIG_CORTEX_M_SYSTICK=y
CONFIG_CONSOLE=y
CONFIG_UART_CONSOLE=y
CONFIG_SERIAL=y
CONFIG_UART_ATMEL_SAM3=y            soc/Kconfig.defconfig: defines some UART definitions
CONFIG_SOC_ATMEL_SAM3_EXT_MAINCK=y  soc/Kconfig.defconfig: selects the external clock
CONFIG_PINMUX=y                     board/Makefile: adds the pinmux if this is set to yes
```

Of these we have not seen the following in any files we have worked on.

```ini
CONFIG_CORTEX_M_SYSTICK=y
CONFIG_CONSOLE=y
CONFIG_UART_CONSOLE=y
CONFIG_SERIAL=y
```

So where are they used? Using ack (a grep like tool) we can search for the
string in the Zephyr OS directories. Lets first look at CORTEX\_M\_SYSTICK. It
is used in the file <z/drivers/timer/Makefile>. The Makefile adds the file
"cortex\_m\_systick.o" if this option is a yes. Lets look at that file. It looks
like it implements a driver for the Cortex-M systick device. That sounds like it
works for Cortex-M3 (SAM3) and Cortex-M4 (SAM4). This driver "provides the
standard kernel 'system clock driver' interfaces (cortex\_m\_systick.c)." Where
does the register address get configured for the __scs.systick? It looks like it
should be defined in scs.c under <z/arch/arm/cortex_m>. This file states that
the linker places \_\_scs at 0xe000e000. Luckily both the SAM3 and SAM4 have the
same register addresses for the systick. So we will leave this for now unless
there is an error the first time we try to bring the board up.

Next setting we will look at is CONFIG\_CONSOLE. The Kconfig item CONSOLE is
used and defined in the file <z/drivers/console/Kconfig>. The config option
CONSOLE allows us to select CONSOLE\_UART\_CONSOLE in the kernel configuration
system. It doesn't do anything else. Looking at the other settings in this file
we see the option UART\_CONSOLE\_ON\_DEV\_NAME. It is currently set to
"UART\_0". We need to change this to "UART\_1" because our available UART is the
second UART with the label UART1 in the data sheet. So lets add this line to our
"atmel\_sam4s\_xpld\_defconfig" file with the value "UART_1".

```ini
CONFIG_UART_CONSOLE_ON_DEV_NAME="UART_1"
```

In a later paragraph we will see that we will be updating the serial driver for
our board and SoC to match the value of the CONFIG\_UART\_CONSOLE\_ON\_DEV\_NAME
variable.

Let's take a look at CONFIG\_UART\_CONSOLE. Searching for CONFIG\_UART\_CONSOLE
shows that it is used in the file <z/drivers/console/Makefile>. It adds the
"uart\_console.o" to the list of build items. Looking at the source comments,
the file "uart\_console.c" looks to be a generic console handler over UART. We
do not need to make any changes or another version to have it work with the SAM4.

Let's consider the next option CONFIG\_SERIAL. This option can be found in the
file <z/drivers/serial/Kconfig>. At the bottom of the file we see Kconfig files
for multiple SoCs. Take a look at the file "Kconfig.atmel\_sam3." This file
defines many variables that will get used in the source. Read this file and take
a note on what they do. We need to make a new file for the Atmel SAM4 we are
working on. We also need to add this file to the Kconfig file in the directory
<z/drivers/serial>. In the new file "Kconfig.atmel\_sam4"  Change all the words
that say SAM3 to SAM4. Also review section 35, UART of the SAM4 data sheet.
Update the "help" block on the menuconfig "UART\_ATMEL\_SAM4". We now have 2
UARTs. Both UARTs only have Tx and Rx pins, no flow control capabilities. Also
note the UART\_ATMEL\_SAM4\_CLK\_FREQ config option. We set this in
<z/arch/arm/soc/Kconfig.defconfig>. We also need to update the variable
UART\_ATMEL\_SAM4\_NAME to match what we set for the config option
CONFIG\_UART\_CONSOLE\_ON\_DEV\_NAME. The value should be "UART\_1" instead of
"UART\_0".

Now we will look at the file "uart\_atmel\_sam3.c." We need to make a copy of
the file "uart\_atmel\_sam3.c" and call it "uart\_atmel\_sam4.c." Rename
everything that is "SAM3" to "SAM4." Recall that in
<z/arch/arm/soc/atmel\_sam4/soc.h> we updated our UART\_ADDR variable. We made
a definition for UART0 and UART1 and set the appropriate address. Find the
UART\_ADDR in the uart\_atmel\_sam4.c file and update it to UART1\_ADDR. UART1
are the available UART pins on the J1 header of the board. We need to update
parts of the function "uart\_sam4\_init". We need to change the PMC so that
UART1 clock is enabled. We also need to make sure the PIO is disabled for our
UART pins, and then we need to make sure our MUX is set for Peripheral A.

Also update the Makefile. Copy the line that adds the object file
"uart\_atmel\_sam3.o." Change it to SAM4.

```make
obj-$(CONFIG_UART_ATMEL_SAM4)	+= uart_atmel_sam4.o
```

Now we have adderssed all the configuration options in arduino\_due\_defconfig
file. We should be good to go with compiling.

# Compiling

We are going to compile one of the sample application for our board. Lets use
the hello-world application at <z/samples/hello\_world/microkernel>. Open up
the [Getting Started Guide](https://www.zephyrproject.org/doc/getting_started/
getting_started.html), and look at the section "Building a Sample
Application." It has the steps to build an application. Follow the steps in
this document. There is a paragraph that says "The above invocation of make
will build the hello_world sample application using the default settings
defined in the application’s Makefile." We need to run the command:

```bash
make BOARD=atmel_sam4s_xpld
```

To remove old code that might be there we must use the following command to
compile:

```bash
make clean && make pristine && time make BOARD=atmel_sam4s_xpld
```

Specifically the command `make clean` clears out all the old build files. The
command `time` measures how long the build takes and outputs it at the end.

# Installing

Now we have a file called "zephyr.elf" and "zephyr.bin". We need to get one of
them on the hardware. The available connections on the board are the USB debug
port and the [JTAG](https://en.wikipedia.org/wiki/JTAG) port. We can find on the
Atmel Online User Guide that the debug USB port is [J-Link
OB](http://www.atmel.com/webdoc/sam4s16xplained/sam4s1
6xplained.iceOnBoard.chapter_vcg_zyg_xf.html). Looking through the site
[www.segger.com] we find the [software page](https://www.segger.com/j-link-
software.html) and we find the [J-Link OB page](https://www.segger.com/jlink-
ob.html). It is assumed that since that second microcontroller was implementing
J-Link that we just need the software to use it in Linux. Download the J-Link
Linux ".tgz" or ".deb" and install J-Link. We should install the ".deb" because
that will also install the udev rules. Open up the document with the name
"UM08001_JLink.pdf." The file is in the directory
<JLink\_Linux\_V610c\_x86\_64\/Doc/> of the J-Link download. We now go to
section 5.1 and read about connecting to a device and the proper steps. Once we
have JLinkExe running then go to section 6. Then we go to section 6.4.5 J-Link
Commander and read. These are the minimum commands required to connect an load
our file "zephyr.bin" to the device:

```bash
JLink> device at91sam4s16c
// Hit enter to accept JTAG as the default and the other default JTAG settings
JLink> connect
.
.
.
Device "ATSAM4S16C" selected.


TotalIRLen = 4, IRPrint = 0x01
AP-IDR: 0x24770011, Type: AHB-AP
Found Cortex-M4 r0p1, Little endian.
FPUnit: 6 code (BP) slots and 2 literal slots
CoreSight components:
ROMTbl 0 @ E00FF000
ROMTbl 0 [0]: FFF0F000, CID: B105E00D, PID: 000BB000 SCS
ROMTbl 0 [1]: FFF02000, CID: B105E00D, PID: 003BB002 DWT
ROMTbl 0 [2]: FFF03000, CID: B105E00D, PID: 002BB003 FPB
ROMTbl 0 [3]: FFF01000, CID: B105E00D, PID: 003BB001 ITM
ROMTbl 0 [4]: FFF41000, CID: B105900D, PID: 000BB9A1 TPIU
Found 1 JTAG device, Total IRLen = 4:
 #0 Id: 0x4BA00477, IRLen: 04, IRPrint: 0x1, CoreSight JTAG-DP (ARM)
Cortex-M4 identified.

JLink> loadbin <zephyr.bin>, 0x400000
Downloading file [/home/justin/Zephyr/zephyr/samples/hello_world/microkernel/outdir/zephyr.bin]...
Comparing flash   [100%] Done.
Erasing flash     [100%] Done.
Programming flash [100%] Done.
Verifying flash   [100%] Done.
J-Link: Flash download: Flash programming performed for 2 ranges (21504 bytes)
J-Link: Flash download: Total time needed: 0.549s (Prepare: 0.200s, Compare: 0.150s, Erase: 0.020s, Program: 0.094s, Verify: 0.001s, Restore: 0.081s)
O.K.
JLink> r
JLink> go
```

[ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format) format files
are the default output from building any program with gcc. If we did not have a
".bin" file for JLinkExe we would have to create one using the program
"objcopy". The program "objcopy" takes an ELF and can create several different
other files from it. We would need to change the file into an Intel Hex file
because that is what J-Link expects. We will use the program "objcopy." It comes
with the GNU binutils package. Here is an example of turning the "zephyr.elf"
file into a "zephyr.bin" file for J-Link.

```bash
objcopy -O binary zephyr.elf zephyr.bin
```

# Testing

Now we need to hook up a USB to UART on our board. We will grab our TTL to USB
device and connect the TX pin on the RX pin on the board. We will also connect
the RX pin from the TTL to USB device to the RX pin on the board. We can
determine which pins and header those are on the board by looking at the
schematic. The section [SAM4S Xplained I/O Expansion Header J1](http://www.atmel
.com/webdoc/sam4s16xplained/sam4s16xplained.Connectors.section_uhn_bzg_xf.html)
shows that pins 3 and 4 are what we are looking for. At this point we should see
our program output on our serial device. That would confirm we added the Atmel
SAM4S Xplained as a board to the Zephyr OS.

## Code

To view all the code changes that were made in this article go to the project
["zephyr_atmel_sam4s_xpld"](https://github.com/fallrisk/zephyr_atmel_sam4s_xpld).
You will see there is only one branch called "atmel\_sam4s\_xpld". Look the
commits made by me Sept. 24 to Oct. 2.

{::comment}Abbreviations{:/}

*[SoC]: System on Chip
*[SCB]: System Code Block
*[UART]: Universal Asynchronous Receive and Transmit
*[IRQ]: Interrupt
*[I2C]: Interintegrated Circuit
*[USB]: Universal Serial Bus
*[TTL]: Transitor Transitor Logic
