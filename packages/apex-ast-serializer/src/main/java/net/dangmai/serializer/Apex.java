package net.dangmai.serializer;

import apex.jorje.semantic.compiler.SourceFile;
import apex.jorje.semantic.compiler.parser.ParserEngine;
import apex.jorje.semantic.compiler.parser.ParserOutput;
import com.gilecode.yagson.YaGsonBuilder;
import com.gilecode.yagson.types.TypeInfoPolicy;
import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.CompactWriter;
import org.apache.commons.cli.*;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class Apex {
    public static void main(String[] args) throws ParseException, IOException {
        Options cliOptions = new Options();
        cliOptions.addOption("a", "anonymous", false, "Parse Anonymous Apex code. If not specify, it will be parsed in Named mode.");
        cliOptions.addOption("f", "format", true, "Format of the output. Possible options: json, xml.");
        cliOptions.addOption("l", "location", true, "Location of Apex class file. If not specified, the Apex content will be read from stdin.");
        cliOptions.addOption("p", "pretty", false, "Pretty print output.");
        cliOptions.addOption("t", "type", false, "JSON format only: Include details type information.");
        cliOptions.addOption("i", "id-ref", false, "XML format only: Use ID reference rather than XPath.");
        cliOptions.addOption("h", "help", false, "Print help information.");

        CommandLineParser cliParser = new DefaultParser();
        CommandLine cmd = cliParser.parse(cliOptions, args);
        Reader apexReader;

        Set<String> acceptedFormats = new HashSet<>(Arrays.asList("xml", "json"));
        String chosenFormat = cmd.getOptionValue("f");

        if (cmd.hasOption("h")) {
            HelpFormatter helpFormatter = new HelpFormatter();
            helpFormatter.printHelp("apex-ast-serializer", cliOptions);
        } else if (!cmd.hasOption("f") || !acceptedFormats.contains(chosenFormat)) {
            System.out.println("Format not specified or not supported.");
        } else {
            if (cmd.hasOption("l")) {
                apexReader = new FileReader(cmd.getOptionValue("l"));
            } else {
                apexReader = new BufferedReader(new InputStreamReader(System.in));
            }

            String sourceCode = IOUtils.toString(apexReader);
            apexReader.close();
            SourceFile sourceFile = SourceFile.builder().setBody(sourceCode).build();
            ParserEngine engine;
            if (cmd.hasOption("a")) {
                engine = ParserEngine.get(ParserEngine.Type.NAMED);
            } else {
                engine = ParserEngine.get(ParserEngine.Type.ANONYMOUS);
            }
            ParserOutput output = engine.parse(sourceFile);

            if (chosenFormat.equals("json")) {
                YaGsonBuilder builder = new YaGsonBuilder();

                if (!cmd.hasOption("t")) {
                    builder.setTypeInfoPolicy(TypeInfoPolicy.DISABLED);
                }
                if (cmd.hasOption("p")) {
                    builder.setPrettyPrinting();
                }
                System.out.print(builder.create().toJson(output));
            } else {
                XStream xstream = new XStream();

                if (cmd.hasOption("i")) {
                    xstream.setMode(XStream.ID_REFERENCES);
                } else {
                    xstream.setMode(XStream.XPATH_ABSOLUTE_REFERENCES);
                }
                if (cmd.hasOption("p")) {
                    System.out.println(xstream.toXML(output));
                } else {
                    StringWriter writer = new StringWriter();
                    xstream.marshal(output, new CompactWriter(writer));
                    System.out.print(writer.toString());
                }
            }
        }
    }
}
