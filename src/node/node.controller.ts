import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { NodeService } from './node.service';
import { CreateNodeDto, UpdateNodeDto } from './dto/node.dto';

@Controller('nodes')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post()
  createNode(@Body() createNodeDto: CreateNodeDto) {
    console.log(createNodeDto);
    return this.nodeService.createNode(createNodeDto);
  }

  @Get()
  getNodes(@Query('name') name?: string) {
    if (name) {
      return this.nodeService.getNodeByName(name);
    }
    return this.nodeService.getAllNodes();
  }

  @Get(':id')
  getNodeById(@Param('id') id: number) {
    return this.nodeService.getNodeById(id);
  }

  @Put('join')
  joinNodes(
    @Query('fromId') fromId?: number,
    @Query('toId') toId?: number,
    @Query('fromName') fromName?: string,
    @Query('toName') toName?: string
  ): Promise<any> {
    // Perform the join operation based on the provided query parameters
    if (fromId && toId) {
      // Join by IDs
      return this.nodeService.joinNodesById(fromId, toId);
    } else if (fromName && toName) {
      // Join by names
      return this.nodeService.joinNodesByName(fromName, toName);
    } else {
      // Handle missing query parameters
      throw new Error(
        'Please provide both "fromId" and "toId" OR both "fromName" and "toName" query parameters.'
      );
    }
  }

  @Put()
  updateNode(
    @Query('id') id: number,
    @Query('name') name: string,
    @Body() updateNodeDto: UpdateNodeDto
  ) {
    if (id) {
      return this.nodeService.updateNodeById(id, updateNodeDto);
    } else if (name) {
      return this.nodeService.updateNodeByName(name, updateNodeDto);
    } else {
      throw new Error('Provide either id or name in query parameters');
    }
  }

  @Delete(':id')
  deleteNode(@Param('id') id: number) {
    return this.nodeService.deleteNode(id);
  }
}
